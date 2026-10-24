import { handleMcpRequest } from "@/lib/mcp/handler";

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}
