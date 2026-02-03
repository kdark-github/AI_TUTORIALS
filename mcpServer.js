// import { McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools.js";

const server = new McpServer({
  name: "Calculator-agent",
  version: "1.0.0",
});

server.registerTool(
  "calculator",
  {
    description: "Perform basic math operations",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
      operation: z.enum(["add", "subtract", "multiply", "divide"]),
    }),
    required: ["a", "b", "operation"],
    outputSchema: z.object({
      result: z.number(),
    }),
  },
  tools.calculator,
);

const transport = new StdioServerTransport();

await server.connect(transport);

console.log("MCP serveris live, ");
