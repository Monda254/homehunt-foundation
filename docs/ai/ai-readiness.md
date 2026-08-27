# AI Readiness & Natural Language Extraction Specs

The matching engine is designed to accommodate future LLM-based preference extraction from natural language queries.

---

## 1. Validation Guards Pipeline
Natural language statements (e.g. *"I need a 2 bedroom apartment in Nyeri under 30k with water and parking"*) must flow through the validation pipeline before updating matching criteria:

```
[User Text Input]
       ↓
[AI Extraction Function] (Extract JSON fields)
       ↓
[Zod Schema Validation] (Validate against UserPreferencesInputSchema)
       ↓
[Normalizer Block] (Capitalize counties/towns, normalize currency)
       ↓
[User Confirmation Screen] (User reviews and saves)
       ↓
[Matching Engine Query]
```

---

## 2. Guardrails
* **No Direct Execution**: Raw AI outputs must never bypass Zod schema validations or run directly in database filters.
* **Deterministic Fallback**: If natural language parsing fails, the dashboard must fall back to the manual multi-step preference wizard.
* **AI Provider Independence**: The matching service communicates via standardized JSON schemas, keeping it decoupled from specific LLM vendors (OpenAI, Gemini, Anthropic).
