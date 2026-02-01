import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "test",
  version: "0.0.1",
});

server.tool(
  "create-user",
  "Create a new user in the database",
  {
    name: z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string(),
  },
  {
    title: "Create User",
    readOnlyHint: false,
    destructiveHint: false,

    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const id = await createUser(params);

      return {
        content: [
          {
            type: "text",
            text: `User created with ID: ${id}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to create user",
          },
        ],
      };
    }
  }
);
// server.tool(
//   "create-user",
//   {
//     description: "Creates a new user with the given name",

//     annotations: {
//       title: "Create User",
//       readOnlyHint: false,
//       destructiveHint: false,
//       idempotentHint: false,
//       openWorldHint: true,
//     },
//     parameters: {
//       type: "object",

//       properties: {
//         name: {
//           type: z.string(),
//           description: "The name of the user to create",
//         },
//         email: {
//           type: z.string(),
//           description: "The email of the user to create",
//         },
//         address: {
//           type: z.string(),
//           description: "The address of the user to create",
//         },
//         phone: {
//           type: z.string(),
//           description: "The phone number of the user to create",
//         },
//       },
//       required: ["name", "email", "address", "phone"],
//     },
//     async execute(params) {
//       const { name } = params;
//       // In a real application, you would add logic to create the user here.
//       return { message: `User '${name}' created successfully.` };
//     },
//   },

//   async (toolInvocation, context) => {
//     console.log(
//       `Tool ${toolInvocation.toolName} invoked with params:`,
//       toolInvocation.parameters
//     );
//   }
// );
function createUser(params: {
  name: string;
  email: string;
  address: string;
  phone: string;
}): Promise<string> {
  // Simulate user creation and return a user ID
  return new Promise((resolve) => {
    setTimeout(() => {
      const userId = "user_" + Math.floor(Math.random() * 10000);
      resolve(userId);
    }, 1000); // Simulate async operation with a delay
  });
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
