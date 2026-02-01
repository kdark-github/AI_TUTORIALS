"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const server = new mcp_js_1.McpServer({
    name: "test",
    version: "0.0.1",
});
server.tool("create-user", "Create a new user in the database", {
    name: zod_1.z.string(),
    email: zod_1.z.string(),
    address: zod_1.z.string(),
    phone: zod_1.z.string(),
}, {
    title: "Create User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
}, async (params) => {
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
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to create user",
                },
            ],
        };
    }
});
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
function createUser(params) {
    // Simulate user creation and return a user ID
    return new Promise((resolve) => {
        setTimeout(() => {
            const userId = "user_" + Math.floor(Math.random() * 10000);
            resolve(userId);
        }, 1000); // Simulate async operation with a delay
    });
}
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main();
