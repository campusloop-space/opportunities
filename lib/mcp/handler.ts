import { NextResponse } from "next/server";
import crypto from "crypto";
import { timingSafeEqual, checkRateLimit } from "../security";
import { mcpTools } from "./tools";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = {
  name: "campusloop-opportunities-mcp",
  version: "1.0.0",
};

export async function handleMcpRequest(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  const authHeader = request.headers.get("authorization") || "";
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "client-default";

  // Rate Limiting (120 req/min per IP)
  const rateLimit = checkRateLimit(clientIp, 120, 60000);
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
          "Retry-After": "60",
          "X-Request-ID": requestId,
        },
      }
    );
  }

  // Authentication check: Bearer <MCP_API_SECRET>
  const mcpSecret = process.env.MCP_API_SECRET;
  if (!mcpSecret) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Server configuration error: MCP secret not configured." },
        id: null,
      },
      { status: 500 }
    );
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const providedToken = match ? match[1].trim() : "";

  if (!providedToken || !timingSafeEqual(providedToken, mcpSecret)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Unauthorized. Valid Bearer token required in Authorization header." },
        id: null,
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="CampusLoop Opportunities MCP"',
          "X-Request-ID": requestId,
        },
      }
    );
  }

  if (request.method === "GET") {
    // Protocol discovery endpoint
    return NextResponse.json({
      status: "ok",
      server: SERVER_INFO,
      protocolVersion: PROTOCOL_VERSION,
      transport: "Streamable HTTP",
      toolsCount: mcpTools.length,
      tools: mcpTools.map((t) => ({ name: t.name, description: t.description })),
    });
  }

  // Parse JSON-RPC 2.0 payload
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error: Invalid JSON." },
        id: null,
      },
      { status: 400 }
    );
  }

  const { jsonrpc, method, params, id = null } = body as {
    jsonrpc?: string;
    method?: string;
    params?: Record<string, unknown>;
    id?: string | number | null;
  };

  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0' and method is required." },
        id,
      },
      { status: 400 }
    );
  }

  try {
    switch (method) {
      case "initialize": {
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: SERVER_INFO,
          },
          id,
        });
      }

      case "notifications/initialized": {
        return new Response(null, { status: 204 });
      }

      case "ping": {
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {},
          id,
        });
      }

      case "tools/list": {
        const toolList = mcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            tools: toolList,
          },
          id,
        });
      }

      case "tools/call": {
        const toolName = params?.name as string;
        const toolArgs = (params?.arguments as Record<string, unknown>) || {};

        if (!toolName) {
          return NextResponse.json({
            jsonrpc: "2.0",
            error: { code: -32602, message: "Invalid params: 'name' is required for tools/call." },
            id,
          });
        }

        const tool = mcpTools.find((t) => t.name === toolName);
        if (!tool) {
          return NextResponse.json({
            jsonrpc: "2.0",
            error: { code: -32601, message: `Tool not found: ${toolName}` },
            id,
          });
        }

        const result = await tool.handler(toolArgs, { type: "mcp_agent", id: clientIp });

        return NextResponse.json({
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
        });
      }

      default: {
        return NextResponse.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: `Method not supported: ${method}` },
          id,
        });
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal tool execution error";
    return NextResponse.json({
      jsonrpc: "2.0",
      error: { code: -32603, message: errorMsg },
      id,
    });
  }
}
