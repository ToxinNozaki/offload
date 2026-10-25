# offload

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![MCP](https://img.shields.io/badge/protocol-MCP-informational)](https://modelcontextprotocol.io)

A tiny [MCP](https://modelcontextprotocol.io) server that lets an AI coding
agent — Claude Code, or anything else that speaks MCP — hand off a sub-task
to a **local model running in [Ollama](https://ollama.com)**, instead of
spending cloud tokens on it.

The agent stays in charge: it decides what to delegate, and it reviews what
comes back. This just gives it a tool to reach a model on your own GPU.

## Why

Cloud models are good at planning, review, and anything that needs real
judgment. A lot of day-to-day coding work isn't that — boilerplate,
straightforward refactors, a helper function you could describe in one
sentence. Running that through a frontier model is paying premium prices for
work a 7B model on your own graphics card can do just as well.

`offload` doesn't replace your agent. It gives it a second pair of hands.

## How it works

```
   your coding agent (e.g. Claude Code)
              │  MCP tool call
              ▼
         offload (this repo)
              │  HTTP
              ▼
      Ollama, on your machine
              │
              ▼
     a local model, on your GPU
```

Two tools are exposed:

- **`ask_local_model`** — sends a prompt (with an optional system prompt and
  model override) to your local Ollama instance and returns the response.
- **`list_local_models`** — lists what you've actually pulled, so the agent
  can check before assuming a model is available.

That's the whole surface area. No orchestration, no agent framework, no
opinion about *when* to delegate — that decision stays with whatever's
calling it.

## Setup

1. Install [Ollama](https://ollama.com) and pull a model that fits your GPU:
   ```
   ollama pull qwen2.5-coder:7b-instruct
   ```
2. Clone this repo and install dependencies:
   ```
   git clone https://github.com/ToxinNozaki/offload.git
   cd offload
   npm install
   ```
3. Point your MCP client at it. For Claude Code, add to a project's
   `.mcp.json` (or your user-level MCP config):
   ```json
   {
     "mcpServers": {
       "offload": {
         "command": "node",
         "args": ["/absolute/path/to/offload/index.js"]
       }
     }
   }
   ```

## Configuration

Both are optional — sane defaults are built in.

| Env var | Default | What it does |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | Where Ollama's API lives |
| `LOCAL_MODEL` | `qwen2.5-coder:7b-instruct` | Model used when a call doesn't specify one |

## Picking a model

Whatever fits in your VRAM and runs fully GPU-offloaded — mixing in CPU
layers is where things get slow. `qwen2.5-coder:7b-instruct` is a solid
default for an 8GB card; scale up if you have the headroom, or try
`deepseek-coder-v2`, `llama3.1`, or `mistral` depending on the task.

## What this is *not*

- Not a replacement for your main coding agent — it's a tool that agent
  calls, nothing more.
- Not an orchestration framework. If you want multi-agent pipelines, review
  gates, or task queues, build that on top — this is deliberately just the
  wire between an agent and a local model.
- Not tied to Claude Code specifically. Anything that speaks MCP over stdio
  can use it.

## Contributing

Issues and PRs welcome. It's a small, single-purpose tool on purpose —
scope-creep PRs (built-in orchestration, a GUI, etc.) are probably better as
a separate project that depends on this one.

## License

MIT — see [LICENSE](LICENSE).
