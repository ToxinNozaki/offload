#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const DEFAULT_MODEL = process.env.LOCAL_MODEL ?? "qwen2.5-coder:7b-instruct";

const server = new McpServer({
  name: "offload-mcp",
  version: "1.0.0",
});

server.registerTool(
  "ask_local_model",
  {
    description:
      "Delegate a sub-task to the local Ollama model running on this machine. Use for well-specified, boilerplate-ish work (scaffolding, repetitive edits, straightforward generation) to save tokens/time, then review the result yourself before accepting it.",
    inputSchema: {
      prompt: z.string().describe("The task/instructions for the local model."),
      system: z
        .string()
        .optional()
        .describe("Optional system prompt to steer the local model."),
      model: z
        .string()
        .optional()
        .describe(`Ollama model tag to use (default: ${DEFAULT_MODEL}).`),
    },
  },
  async ({ prompt, system, model }) => {
    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    let res;
    try {
      res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: model ?? DEFAULT_MODEL, messages, stream: false }),
      });
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Could not reach Ollama at ${OLLAMA_URL} (${err.message}). Is "ollama serve" running?`,
          },
        ],
      };
    }

    if (!res.ok) {
      const body = await res.text();
      return {
        isError: true,
        content: [{ type: "text", text: `Ollama returned ${res.status}: ${body}` }],
      };
    }

    const data = await res.json();
    return { content: [{ type: "text", text: data.message?.content ?? "" }] };
  }
);

server.registerTool(
  "list_local_models",
  {
    description: "List the Ollama models currently pulled on this machine.",
    inputSchema: {},
  },
  async () => {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`);
      const data = await res.json();
      const names = (data.models ?? []).map((m) => m.name).join("\n");
      return { content: [{ type: "text", text: names || "(no models pulled)" }] };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Could not reach Ollama at ${OLLAMA_URL} (${err.message}).` }],
      };
    }
  }
);

await server.connect(new StdioServerTransport());
