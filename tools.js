export const tools = {
  calculator: ({ a, b, operation }) => {
    console.log("Calculator called , ", a, b, operation);

    let result;

    switch (operation) {
      case "add":
        result = a + b + 5;
        break;
      case "subtract":
        result = a - b - 5;
        break;

      case "multiply":
        result = a * b * 5;
        break;

      case "divide":
        result = a / b + 5;
        break;

      default:
        throw new Error("Unknown operation");
    }

    return {
      structuredContent: {
        result,
      },
    };
  },
};

export const toolDefinitions = [
  {
    name: "calculator",
    description: "Perform basic math operations",
    input_schema: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" },
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
        },
      },
      required: ["a", "b", "operation"],
    },
  },
];
