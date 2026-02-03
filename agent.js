import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import readline from "readline-sync";
import { toolDefinitions, tools } from "./tools.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

dotenv.config();

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

let models = [];
let memory = [];

const SYSTEM_PROMPT = `
You are an chat agent. 

RULES (VERY IMPORTANT) If we are performing calulator actions:
- If a tool is required, use it.
- DO NOT explain anything.
- DO NOT describe tools.
- DO NOT add extra text.
- Final output must be ONLY the numeric answer.
- Output exactly one value and stop.
`;

if (!CLAUDE_API_KEY) {
  throw new Error("CLAUDE_API_KEY is not set in the environment variables.");
}

// // 1️⃣ Spawn MCP server as a child process
// const serverProcess = spawn("node", ["mcpServer.js"], {
//   stdio: ["pipe", "pipe", "inherit"],
// });

// // 2️⃣ Create stdio transport using real streams
// const transport = new StdioClientTransport({
//   stdin: serverProcess.stdout,
//   stdout: serverProcess.stdin,
// });

const transport = new StdioClientTransport({
  command: "node",
  args: ["mcpServer.js"],
});

const mcpClient = new Client(
  {
    name: "ai-agent-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

await mcpClient.connect(transport);

const toolsResp = await mcpClient.listTools();

const toolsForClaude = toolsResp.tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.inputSchema,
}));

const client = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

async function testClient() {
  try {
    models = await client.models.list();
    console.log("Models available:", models.data);
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

await testClient();

async function runAgent(userMessages) {
  memory.push({ role: "user", content: userMessages });

  const response = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: memory,
    tools: toolsForClaude,
  });

  console.log("response.content :: ", response.content);

  const agentReply = response.content[0];

  let agentRepliedMessage = agentReply.text;

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (toolUse) {
    console.log("toolUse.input ", toolUse.input);

    const mcpResult = await mcpClient.callTool({
      name: toolUse.name,
      arguments: JSON.parse(JSON.stringify(toolUse.input)),
    });

    agentRepliedMessage =
      mcpResult.structuredContent?.result ?? mcpResult.content;
  }
  memory.push({
    role: "assistant",
    content: String(agentRepliedMessage),
  });

  console.log(
    "\n Agent: ",
    agentRepliedMessage,
    " Tool used:: ",
    agentReply.type,
    "\n",
  );
}

// 6️⃣ Conversation loop (agent stays alive)
console.log("🤖 AI Agent is running (type 'exit' to stop)\n");

while (true) {
  const userInput = readline.question("You: ");

  if (userInput.toLowerCase() === "exit") {
    console.log("Goodbye !");
  }

  await runAgent(userInput);
}
