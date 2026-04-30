# AI Design-to-Code Pipeline API

HTTP API for the take-home assignment from [03-solution-architect.md](./03-solution-architect.md).

The service accepts a UI component brief and runs a multi-stage agent pipeline that:
- parses the brief
- analyzes missing states and constraints
- generates component interfaces
- generates unit tests
- generates composed e2e tests
- generates component code
- validates the result

The implementation is intentionally compact. It is not a generic agent platform.

## What is implemented

The project exposes:
- `POST /create-component`

Request body:

```json
{
  "componentDescription": "string",
  "figmaUrl": "string | null",
  "screenshotUrl": "string | null"
}
```

Response shape follows the assignment output contract:

```json
{
  "component": {
    "name": "string",
    "type": "card | form | table | modal | page | wizard",
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
    "framework": "React",
    "files": [
      {
        "filename": "string",
        "content": "string"
      }
    ],
    "states_covered": ["string"],
    "tokens_used": ["string"]
  },
  "validation": {
    "token_compliance": true,
    "states_coverage": "x/y",
    "accessibility_score": "string",
    "issues_found": ["string"],
    "hallucinations_caught": ["string"]
  }
}
```

## Agent architecture

The implemented pipeline is:

1. `parsing`
2. `gap_analysis`
3. `resolving_gaps`
4. `user_flows`
5. `component_interfaces` - iterative, one component at a time
6. `unit_tests` - iterative, one component at a time
7. `e2e_tests` - composed flow level
8. `component_generation` - iterative, one component at a time
9. `validation`

There is also a selective regeneration loop:
- `component_generation -> validation`
- if validation finds deterministic regeneration blockers, only affected components are regenerated

The orchestrator stores run progress in MongoDB, including:
- artifacts
- per-step reports
- per-step token usage
- final result

Each run also stores detailed token accounting:
- total token usage for the whole run
- token usage for every individual step
- retry-aware token aggregation per step

This gives direct visibility into run cost and makes it possible to see which stages need optimization first.

Prompts are versioned with:
- `version`
- `variant`

`variant` is there intentionally for future A/B testing of prompt strategies.

## Validation and reliability behavior

Implemented:
- structured JSON schema validation per stage
- retry on invalid JSON
- retry on output schema mismatch
- known token whitelist
- hallucinated CSS variable / token detection
- canonical state model
- deterministic state coverage summary
- validation feedback for selective regeneration
- `MAX_STEP_LIMIT` interruption with partial final result and run status `interrupted`

Current validation checks combine:
- deterministic checks
- LLM-produced validation output

Deterministic checks currently cover:
- token compliance
- hallucinated tokens / CSS variables
- canonical state coverage
- part of callback wiring / contract mismatch detection

## How to run

### Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose
- OpenAI API key

### 1. Configure environment

Create `.env` from `.env.example`.

Example:

```bash
cp .env.example .env
```

Important variables:

```env
NODE_ENV=development
PORT=3000
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=sa_root
MONGO_INITDB_ROOT_PASSWORD=change_me
MONGO_INITDB_DATABASE=sa_db
MONGODB_URI=mongodb://sa_root:change_me@sa-db:27017/sa_db?authSource=admin

OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-5.2

MAX_STEP_LIMIT=40
```

Notes:
- `OPENAI_API_KEY` is required.
- `MAX_STEP_LIMIT` caps the total number of executed pipeline steps. If reached, the run stops and returns accumulated data. The persisted run status becomes `interrupted`.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the full stack

The main run path for this project is the full Docker Compose stack:

```bash
docker compose up -d --build
```

This starts both:
- `sa-db`
- `sa-app`

API will listen on `http://localhost:3000`.

### 4. Optional local development mode

If you want to run only the app process locally during development:

```bash
npm run start:dev
```

This is useful for iteration, but the primary documented startup path for the assignment is `docker compose up -d --build`.

## How to call the API

Example:

```bash
curl -X POST http://localhost:3000/create-component \
  -H 'Content-Type: application/json' \
  -d '{
    "componentDescription": "Payment card component. Shows card number (masked: **** **** **** 1234), expiry date, cardholder name, card brand icon (Visa/Mastercard/Amex). Used in merchant dashboard to display saved payment methods. User can select a card or delete it.",
    "figmaUrl": null,
    "screenshotUrl": null
  }'
```

## Tests

Run all tests:

```bash
npm test
```

Run build:

```bash
npm run build
```

Run lint:

```bash
npx eslint "src/**/*.ts"
```

## Example inputs and expected output behavior

Below are the three assignment examples and what this implementation is expected to produce at a high level.

### Example 1: Payment card

Input:

```text
Payment card component. Shows card number (masked: **** **** **** 1234),
expiry date, cardholder name, card brand icon (Visa/Mastercard/Amex).
Used in merchant dashboard to display saved payment methods.
User can select a card or delete it.
```

Expected behavior:
- root component type `card`
- extracted states such as selected / delete-related states
- gap analysis adds missing destructive-flow and accessibility states
- generated code includes root component plus related action components
- validation reports token compliance, state coverage, and any callback/integration defects

### Example 2: Transaction table

Input:

```text
Transaction table with columns: date, amount, status, merchant name, payment method.
Supports sorting by any column and pagination (25/50/100 per page).
Status values: pending, completed, failed, refunded.
Each status has a colored badge. Row click opens transaction details.
```

Expected behavior:
- root component type `table`
- extracted sorting/pagination constraints
- gap analysis fills loading / empty / error / disabled / unknown-status cases
- generated code includes table, pagination, and status badge files
- validation detects integration issues such as export mismatches or payload-shape drift if generation gets them wrong

### Example 3: KYC verification wizard

Input:

```text
KYC verification wizard. 3 steps: personal info, document upload, selfie.
Step indicator at the top. Back/Next navigation.
Document upload supports drag-and-drop and file picker (PDF, JPG, PNG, max 10MB).
Final step shows verification status: pending review, approved, rejected.
```

Expected behavior:
- root component type `wizard`
- extraction of step flow, upload constraints, async states, and status states
- gap analysis adds validation, upload failure, permission, submission, and fallback states
- generation produces smart and dumb components around the wizard flow
- validation checks token compliance, state coverage, and wiring defects across the composed flow

## What is done from the assignment requirements

Done:
- HTTP API instead of CLI
- explicit multi-stage agent architecture
- more than 3 stages
- structured JSON schema at every stage
- retries for invalid JSON and invalid stage output schema
- final validation stage is present
- final response uses the expected output shape
- environment-driven configuration
- design system token context is provided programmatically
- hallucinated token / CSS variable validation is implemented
- unit-test generation stage is implemented
- e2e-test generation stage is implemented
- iterative component generation is implemented
- partial selective regeneration is implemented
- detailed token logging per run and per step is implemented
- prompt `variant` support is implemented for future A/B testing

Partially done:
- accessibility validation exists, but it is not a full deterministic accessibility audit
- integration consistency validation exists, but not all detected structural issues are currently regeneration blockers
- state coverage exists, but the quality still depends on canonical state modeling and prompt compliance
- existing component context is passed in a focused way, but this is not a full design-system registry

Not done:
- no Figma API integration
- no screenshot ingestion pipeline
- no real build/run/test of the generated frontend artifacts in a separate generated project
- no synchronization with a real external design system source of truth

## Why Figma API integration was not done

I did not integrate with the Figma API.

Reason:
- I did not have a single real Figma file available for testing in this assignment context
- I did not want to spend the limited time budget searching for public mockups and then building an integration that I could not validate properly

So `figmaUrl` is accepted by the API and can be passed through the pipeline context, but there is no live Figma fetch, parse, or token extraction from the Figma API.

## Main trade-offs

1. The solution is pipeline-first, not platform-first.
   - I optimized for the assignment workflow, not for a reusable orchestration framework.

2. Validation is hybrid.
   - Deterministic checks are used where correctness matters most: token whitelist, canonical states, some contract checks.
   - LLM-based validation is still used for higher-level review.

3. Generated code is not compiled in a separate generated app.
   - That would improve confidence, but it would add more infrastructure and time.

4. Selective regeneration is intentionally scoped.
   - It is useful, but still not complete enough to fix every structural defect automatically.

5. The known token list is local and synthetic.
   - It is enough to validate hallucinations, but it is not connected to a real fintech design system.

6. Unit-test and e2e-test generation are included as preparation for a stricter next step.
   - The intended follow-up is to execute generated code inside a Docker sandbox and validate it with real tests.
   - That sandboxed execution layer is not implemented yet, but the test-generation stages are already in place to support it.

## AI usage

Used:
- OpenAI API
- model configured via `OPENAI_MODEL`

Where AI is used:
- parsing
- gap analysis
- resolving gaps
- user flow design
- component interface generation
- unit-test generation
- e2e-test generation
- component generation
- validation

What worked:
- structured staged generation with schema validation
- iterative generation with targeted context
- canonical token and state validation as a guardrail around model output
- per-step token accounting gives cost visibility
- unit/e2e test generation improves future extensibility toward sandboxed execution

What did not work well:
- LLM output can still drift on contracts between parent and child components
- validation policy needed repeated tightening to avoid false regeneration blockers
- some structural issues are detected but not yet promoted strongly enough in orchestration policy

## Current weak spots

The biggest remaining weak spots are:
- contract mismatch severity is still too soft in some completed runs
- generated code is not executed in an isolated generated project
- screenshot/Figma inputs are not deeply processed
- validation still mixes deterministic and advisory findings, and that policy can be tightened further

## Repository notes

Relevant files:
- [03-solution-architect.md](./03-solution-architect.md)
- [src/app.controller.ts](./src/app.controller.ts)
- [src/orchestrator/use-cases/run-orchestrator.use-case.ts](./src/orchestrator/use-cases/run-orchestrator.use-case.ts)
- [src/validation/use-cases/run-validation-step.use-case.ts](./src/validation/use-cases/run-validation-step.use-case.ts)
- [src/component-generation/use-cases/run-component-generation-step.use-case.ts](./src/component-generation/use-cases/run-component-generation-step.use-case.ts)
