# AI Production Readiness & Safety Policy

## System Architecture
HomeHunt integrates artificial intelligence for property summary extraction and tenant assistance through `src/core/ai/ai.service.ts`.

## Safety Guarantees & Fallback Mechanism
1. **Prompt Injection Protection**: All user input to AI routines is filtered through `sanitizeUntrustedText()`, removing systemic command overrides and prompt manipulation tags.
2. **Deterministic Fallback Engine**: If no external LLM API key (`OPENAI_API_KEY`, `GEMINI_API_KEY`) is configured, or if external API connection times out/fails, the system routes queries to `DeterministicFallbackProvider`.
3. **Usage Tracking & Cost Cap**: Every AI interaction logs prompt tokens, completion tokens, estimated cost, and user ID to the `ai_usage` database table.

## Safety & Evaluation Verification
Run the Vitest AI safety evaluation suite:
```bash
npx vitest run src/core/ai/__tests__/ai-evaluation.test.ts
```
