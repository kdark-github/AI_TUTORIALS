import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import readline from "readline-sync";
import { toolDefinitions, tools } from "./tools.js";

dotenv.config();

//Hello

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

let models = [];
let memory = [];

const SYSTEM_PROMPT = `
You are a calculation agent.

RULES (VERY IMPORTANT):
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
    tools: toolDefinitions,
  });

  console.log("response.content :: ", response.content);

  const agentReply = response.content[0];

  let agentRepliedMessage = agentReply.text;

  if (agentReply.type === "tool_use") {
    agentRepliedMessage = tools[agentReply.name](agentReply.input);
  }

  memory.push({ role: "assistant", content: agentRepliedMessage });

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
