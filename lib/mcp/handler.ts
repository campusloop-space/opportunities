import { NextResponse } from "next/server";
import crypto from "crypto";
import { timingSafeEqual, checkRateLimit } from "../security";
import { mcpTools } from "./tools";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = {
  name: "campusloop-opportunities-mcp",
  version: "1.0.0",
};

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, X-API-Key, X-MCP-Secret, api-key, Accept, mcp-session-id, X-Request-ID",
  "Access-Control-Expose-Headers": "X-Request-ID, Content-Type, WWW-Authenticate",
  "Access-Control-Max-Age": "86400",
};

export async function handleMcpRequest(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);

  // Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "client-default";

  // Rate Limiting (180 req/min per IP)
  const rateLimit = checkRateLimit(clientIp, 180, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Rate limit exceeded. Try again later." },
        id: null,
      },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": "60",
          "X-Request-ID": requestId,
        },
      }
    );
  }

  // MCP Secret Verification
  const mcpSecret = process.env.MCP_API_SECRET;
  if (!mcpSecret) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Server configuration error: MCP secret not configured." },
        id: null,
      },
      { status: 500, headers: corsHeaders }
    );
  }

  // Extract token from various supported header & query formats:
  let providedToken = "";

  // 1. Authorization header: "Bearer <token>" or raw "<token>"
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    providedToken = match ? match[1].trim() : authHeader.trim();
  }

  // 2. Custom headers commonly used by Composio, Smithery, and custom clients
  if (!providedToken) {
    providedToken =
      request.headers.get("x-api-key")?.trim() ||
      request.headers.get("x-mcp-secret")?.trim() ||
      request.headers.get("api-key")?.trim() ||
      "";
  }

  // 3. Query string parameters: ?apiKey=, ?api_key=, ?token=, ?secret=
  if (!providedToken) {
    providedToken =
      url.searchParams.get("apiKey")?.trim() ||
      url.searchParams.get("api_key")?.trim() ||
      url.searchParams.get("token")?.trim() ||
      url.searchParams.get("secret")?.trim() ||
      "";
  }

  if (!providedToken || !timingSafeEqual(providedToken, mcpSecret)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message:
            "Unauthorized. Please provide your MCP API secret via 'Authorization: Bearer <secret>', 'X-API-Key: <secret>', or '?apiKey=<secret>'.",
        },
        id: null,
      },
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "WWW-Authenticate": 'Bearer realm="CampusLoop Opportunities MCP"',
          "X-Request-ID": requestId,
        },
      }
    );
  }

  // GET Request Handling: SSE Stream or Tool Catalog
  if (request.method === "GET") {
    const acceptHeader = request.headers.get("accept") || "";
    const isSse = acceptHeader.includes("text/event-stream") || url.pathname.endsWith("/sse");

    if (isSse) {
      const sessionId = url.searchParams.get("sessionId") || crypto.randomUUID();
      const endpointUrl = `${url.origin}/api/mcp?sessionId=${sessionId}`;
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        start(controller) {
          // Emit standard MCP SSE endpoint event
          controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUrl}\n\n`));
          // Emit initial keep-alive comment
          controller.enqueue(encoder.encode(`: connected to campusloop opportunities mcp\n\n`));
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Request-ID": requestId,
        },
      });
    }

    // Direct JSON-RPC method query over GET (e.g. ?method=tools/list)
    const methodParam = url.searchParams.get("method");
    if (methodParam === "tools/list") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          result: {
            tools: mcpTools.map((t) => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema,
            })),
          },
          id: 1,
        },
        { headers: corsHeaders }
      );
    }

    // Default GET: Machine & human readable server capability discovery
    return NextResponse.json(
      {
        status: "ok",
        server: SERVER_INFO,
        protocolVersion: PROTOCOL_VERSION,
        transport: "Streamable HTTP & SSE",
        capabilities: {
          tools: { listChanged: false },
        },
        toolsCount: mcpTools.length,
        tools: mcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      },
      { headers: corsHeaders }
    );
  }

  // POST Request: Parse JSON-RPC 2.0 payload (single or batch)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error: Invalid JSON." },
        id: null,
      },
      { status: 400, headers: corsHeaders }
    );
  }

  if (Array.isArray(body)) {
    const responses = [];
    for (const item of body) {
      if (item && typeof item === "object") {
        const resp = await processSingleJsonRpc(item as Record<string, unknown>, clientIp);
        if (resp !== null) {
          responses.push(resp);
        }
      }
    }
    if (responses.length === 0) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    return NextResponse.json(responses, { headers: corsHeaders });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request: Body must be a JSON object or array." },
        id: null,
      },
      { status: 400, headers: corsHeaders }
    );
  }

  const response = await processSingleJsonRpc(body as Record<string, unknown>, clientIp);
  if (response === null) {
    // Notification with no response expected
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return NextResponse.json(response, { headers: corsHeaders });
}

async function processSingleJsonRpc(
  message: Record<string, unknown>,
  clientIp: string
): Promise<Record<string, unknown> | null> {
  const { jsonrpc, method, params, id = null } = message as {
    jsonrpc?: string;
    method?: string;
    params?: Record<string, unknown>;
    id?: string | number | null;
  };

  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return {
      jsonrpc: "2.0",
      error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0' and method is required." },
      id,
    };
  }

  try {
    switch (method) {
      case "initialize": {
        return {
          jsonrpc: "2.0",
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: SERVER_INFO,
          },
          id,
        };
      }

      case "notifications/initialized": {
        // Notifications typically have no id and expect no response
        return id !== null && id !== undefined ? { jsonrpc: "2.0", result: {}, id } : null;
      }

      case "ping": {
        return {
          jsonrpc: "2.0",
          result: {},
          id,
        };
      }

      case "tools/list": {
        const toolList = mcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
        return {
          jsonrpc: "2.0",
          result: {
            tools: toolList,
          },
          id,
        };
      }

      case "tools/call": {
        const toolName = params?.name as string;
        const toolArgs = (params?.arguments as Record<string, unknown>) || {};

        if (!toolName) {
          return {
            jsonrpc: "2.0",
            error: { code: -32602, message: "Invalid params: 'name' is required for tools/call." },
            id,
          };
        }

        const tool = mcpTools.find((t) => t.name === toolName);
        if (!tool) {
          return {
            jsonrpc: "2.0",
            error: { code: -32601, message: `Tool not found: ${toolName}` },
            id,
          };
        }

        const result = await tool.handler(toolArgs, { type: "mcp_agent", id: clientIp });

        return {
          jsonrpc: "2.0",
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
          id,
        };
      }

      default: {
        return {
          jsonrpc: "2.0",
          error: { code: -32601, message: `Method not supported: ${method}` },
          id,
        };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal tool execution error";
    return {
      jsonrpc: "2.0",
      error: { code: -32603, message: errorMsg },
      id,
    };
  }
}
