# offload — orientation for a fresh session

Read [DEVLOG.md](DEVLOG.md) first — it has build history and the reasoning
behind what's deliberately *not* built yet.

Quick orientation:
- This is a small MCP server (`index.js`), not an app — one file, two tools.
- It wraps Ollama's local HTTP API (`/api/chat`, `/api/tags`). It does not
  run or manage Ollama itself; that's assumed to already be running.
- Keep it scoped. See README's "What this is not" before adding
  orchestration, a GUI, or multi-model logic — those belong in a project
  that *depends on* this one, not inside it.
