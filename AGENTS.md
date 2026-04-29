# AGENTS.md

## Scope

- Build the take-home assignment described in `03-solution-architect.md` as an HTTP API.
- The primary delivery is a POST endpoint that accepts a UI component description as input and runs a multi-stage agent pipeline.
- The pipeline must explicitly cover parsing and extraction, gap analysis, code generation, and validation.
- Each stage must return structured JSON and include handling for unreliable model output such as invalid structure, incomplete data, and hallucinated token references.
- Keep the solution compact and focused on the assignment; avoid unrelated platform features unless they are required to support the endpoint.

## Product Context

- This project models an AI-assisted design-to-code pipeline for a fintech team that maintains a component library.
- The endpoint receives a component brief, optionally enriched with a screenshot or Figma link, and converts it into implementation-oriented output.
- The system must extract component type, states, design tokens, constraints, and business context from the input.
- The system must analyze missing states, accessibility gaps, and responsive concerns before generating code.
- The generated result must produce working component code aligned with the design system and cover both explicit and inferred states.
- Validation is part of the core product behavior: the system must verify token compliance, state coverage, accessibility basics, and non-existent design-system references before returning the final response.

## Architecture Rules

- Organize code by feature.
- Keep constants and enums inside feature-local `constants/` directories.
- Keep interfaces and other type definitions inside feature-local `types/` directories.
- Prefer small, explicit modules over shared generic abstractions unless reuse is already proven.

## TypeScript Rules

### General

- No `any`.
- Do not use `object` when a precise interface can be defined.
- Avoid `as` casts unless there is no cleaner option.
- Prefer strict typing.
- Minimize unrelated formatting changes.
- Do not add new comments unless explicitly requested.
- Do not remove existing comments unless necessary.

### Interfaces and Enums

- Prefer `interface` over `type` whenever an interface can express the shape.
- Every interface name must start with the `I` prefix. Example: `ISomeInterface`.
- Do not use string-union type aliases when an enum is appropriate.
- Prefer enums in uppercase snake case. Example:

```ts
export enum HOTEL_TYPE {
  HOTEL = "hotel",
  APARTMENT = "apartment",
}
```

- If an enum values array is needed, derive it via `Object.values(...)`. Example:

```ts
const HOTEL_TYPES_ARRAY = Object.values(HOTEL_TYPE);
```

## Control Flow Rules

- Do not use `while (true)`.
- All iteration must have explicit and controlled termination conditions.

## Formatting Rules

- Complex multiline conditions must be formatted like this:

```ts
if (
  condition1
    && condition2
    || condition3
) {
  handleCase();
}
```

- Do not format complex conditions like this:

```ts
if (
  condition1 &&
    condition2 ||
    condition3
) {
  handleCase();
}
```

## Comments

- Comments are allowed only rarely.
- Use comments only when important constraints or conditions are not obvious from the code itself.
- All comments must be in English.
