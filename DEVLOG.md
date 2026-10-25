# Dev log

Kept for continuity — read this before picking the project back up in a new
session. Newest at the top.

## 2026-10-25 — v1

- Built as a minimal MCP server: `ask_local_model` and `list_local_models`,
  both thin wrappers over Ollama's `/api/chat` and `/api/tags`.
- Deliberately scoped down from a much bigger original idea (a full
  multi-agent "AI dev studio" platform). Real day-one use turned out to be
  much narrower: let a cloud coding agent delegate well-specified sub-tasks
  to a local model to save tokens/time, while staying the one reviewing the
  result. Scope-creep features (orchestration, multi-agent debate, a GUI,
  memory/vector search) are explicitly out — see README's "What this is
  not."
- Verified end-to-end: spawned the server as a real MCP process over stdio
  (not just the underlying HTTP call), called `ask_local_model`, confirmed
  correct output. Also confirmed 100% GPU offload via `ollama ps` and
  ~49 tok/s warm throughput with `qwen2.5-coder:7b-instruct` on an 8GB card
  (first call after a cold start is much slower — that's one-time model
  load + CUDA init, not representative).
- No persistence, no config file, no retry/backoff — if that's needed later,
  add it, but it wasn't needed to prove the concept works.
