import { describe, it, expect, beforeAll } from "vitest";
import { handleMcpRequest, corsHeaders } from "../lib/mcp/handler";
import { mcpTools } from "../lib/mcp/tools";

const TEST_SECRET = "test_mcp_secret_token_1234567890123456";

beforeAll(() => {
  process.env.MCP_API_SECRET = TEST_SECRET;
});

describe("MCP Streamable HTTP Protocol & Authentication", () => {
  it("rejects request when Authorization header is missing (401)", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(401);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    const body = await res.json();
    expect(body.error.code).toBe(-32001);
  });

  it("authenticates via X-API-Key header (Composio support)", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": TEST_SECRET,
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 10 }),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.tools.length).toBe(15);
  });

  it("authenticates via ?apiKey= query parameter (Composio query param support)", async () => {
    const req = new Request(`https://opportunities.campusloop.space/api/mcp?apiKey=${TEST_SECRET}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 11 }),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.tools.length).toBe(15);
  });

  it("handles OPTIONS request with CORS preflight headers", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "OPTIONS",
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
  });

  it("handles SSE connection on GET with Accept: text/event-stream", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${TEST_SECRET}`,
      },
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("handles batch JSON-RPC requests in a single HTTP payload", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
      },
      body: JSON.stringify([
        { jsonrpc: "2.0", method: "initialize", id: 1 },
        { jsonrpc: "2.0", method: "tools/list", id: 2 },
      ]),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body[0].id).toBe(1);
    expect(body[1].id).toBe(2);
    expect(body[1].result.tools.length).toBe(15);
  });

  it("handles 'initialize' method with valid token", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test-client", version: "1.0.0" },
        },
        id: 101,
      }),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.jsonrpc).toBe("2.0");
    expect(body.id).toBe(101);
    expect(body.result.protocolVersion).toBe("2024-11-05");
    expect(body.result.serverInfo.name).toBe("campusloop-opportunities-mcp");
  });

  it("handles 'tools/list' and returns 15 valid tools", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 102,
      }),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.tools).toBeDefined();
    expect(body.result.tools.length).toBe(15);

    const toolNames = body.result.tools.map((t: { name: string }) => t.name);
    expect(toolNames).toContain("create_opportunity");
    expect(toolNames).toContain("upsert_opportunity");
    expect(toolNames).toContain("update_opportunity");
    expect(toolNames).toContain("publish_opportunity");
    expect(toolNames).toContain("close_opportunity");
    expect(toolNames).toContain("mark_opportunity_expired");
    expect(toolNames).toContain("check_duplicate_opportunities");
    expect(toolNames).toContain("get_categories");
    expect(toolNames).toContain("bulk_upsert_opportunities");
  });

  it("handles 'tools/call' for get_categories", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "get_categories",
          arguments: {},
        },
        id: 103,
      }),
    });

    const res = await handleMcpRequest(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.content[0].type).toBe("text");
    const parsed = JSON.parse(body.result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(7);
  });

  it("returns -32601 when calling unknown tool", async () => {
    const req = new Request("https://opportunities.campusloop.space/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_SECRET}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "non_existent_tool",
          arguments: {},
        },
        id: 104,
      }),
    });

    const res = await handleMcpRequest(req);
    const body = await res.json();
    expect(body.error.code).toBe(-32601);
  });
});
