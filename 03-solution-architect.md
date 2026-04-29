# Unlimit / Test assignment / AI Solution Architect

# Take-home assignment: "Design-to-Code Pipeline Agent" (up to 3 hours)

The goal is to evaluate your ability to design and implement a multi-agent system that automates the design-to-code process.

**Estimated time limit: up to 3 hours** of focused work. Clean design and reasonable trade-offs are more important than exhaustive edge-case coverage.

---

## Context

You are designing an AI-powered pipeline for a fintech company. The team develops a component library in a framework of your choice (Angular or React).

Current process: designer creates a mockup in Figma → developer manually writes a component → QA checks pixel-perfect compliance.

**Problems:**
- Developer spends ~40% of time translating mockups into code
- Pixel-perfect checking is manual and misses errors
- Design tokens in Figma and code get out of sync
- Corner cases (empty, error, loading states) are often not covered in mockups — developer improvises

---

## Task

Implement an agent (CLI, HTTP API, or web UI) that takes a **UI component description** as input (text + optionally a screenshot/Figma link) and executes a pipeline:

### 1. Parsing & Extraction
Extracts from the description:
- Component type (form, card, table, modal...)
- States (which are specified, which are missing)
- Design tokens (colors, fonts, spacing)
- Business context (payment form, dashboard, landing)

### 2. Gap Analysis
Identifies what's missing:
- Missing states (empty, loading, error, disabled)
- Accessibility gaps (contrast, ARIA, keyboard nav)
- Responsive breakpoints
- Generates recommendations

### 3. Code Generation
Generates:
- A component with working code
- Using design system tokens
- Covering all states (including those found in step 2)

### 4. Validation
Checks the generated code:
- Token compliance
- State coverage
- Accessibility compliance (basic)
- Detects hallucinations (non-existent CSS variables, tokens)

---

## Example Inputs

**Input 1:**
```
Payment card component. Shows card number (masked: **** **** **** 1234),
expiry date, cardholder name, card brand icon (Visa/Mastercard/Amex).
Used in merchant dashboard to display saved payment methods.
User can select a card or delete it.
```

**Input 2:**
```
Transaction table with columns: date, amount, status, merchant name, payment method.
Supports sorting by any column and pagination (25/50/100 per page).
Status values: pending, completed, failed, refunded.
Each status has a colored badge. Row click opens transaction details.
```

**Input 3:**
```
KYC verification wizard. 3 steps: personal info, document upload, selfie.
Step indicator at the top. Back/Next navigation. 
Document upload supports drag-and-drop and file picker (PDF, JPG, PNG, max 10MB).
Final step shows verification status: pending review, approved, rejected.
```

---

## Agent Architecture Requirements

**Mandatory:**
- **Multi-agent architecture**: at least 3 explicit stages (parsing → analysis → generation → validation), not a single "magic prompt"
- **Structured output**: JSON with a clear schema at each stage
- **Error handling**: invalid JSON → retry; hallucinated tokens → validation against known token list; incomplete output → re-prompt
- **Design system context**: the agent must be aware of existing tokens and components (provide as system context)

---

## Expected Output

```json
{
  "component": {
    "name": "string",
    "type": "form | card | table | modal | page",
    "business_context": "string"
  },
  "extraction": {
    "specified_states": ["string"],
    "tokens_referenced": ["string"],
    "constraints": ["string"]
  },
  "gap_analysis": {
    "missing_states": ["string"],
    "accessibility_gaps": ["string"],
    "responsive_gaps": ["string"],
    "recommendations": ["string"]
  },
  "generated_code": {
    "framework": "framework name",
    "files": [
      { "filename": "string", "content": "string" }
    ],
    "states_covered": ["string"],
    "tokens_used": ["string"]
  },
  "validation": {
    "token_compliance": true,
    "states_coverage": "12/12",
    "accessibility_score": "string",
    "issues_found": ["string"],
    "hallucinations_caught": ["string"]
  }
}
```

---

## AI Usage (Mandatory)

You must use AI as part of your workflow. Any model/tool is allowed (OpenAI, Anthropic, Gemini, local LLM, etc.). Any LLM/agent libraries/frameworks (LangChain, Semantic Kernel, CrewAI, etc.).

In your submission, briefly describe:
- What AI tool you used
- Where it was used
- What worked and what didn't

**Important:**
- Move configuration (API keys, endpoints) to external settings/environment variables
- Keep the solution compact and readable — no need for heavy enterprise boilerplate

---

## Submission

Include:
1. Link to repository with your code
2. README: how to run, agent architecture, test examples (minimum 3 input → output)
3. Note on trade-offs and AI usage

---

## Note

This is not about generating perfect production code. This is about how you think as an architect when designing AI-powered automation pipelines, how you structure multi-stage agent workflows, and how you handle the inherent unreliability of LLM outputs.
