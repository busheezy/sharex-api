# Project standards

Follow the existing architecture and preserve public APIs. Keep changes focused and reviewable.

- Use the Node and pnpm versions pinned in `.nvmrc` and `package.json`.
- Use Oxlint and Oxfmt; do not reintroduce ESLint or Prettier.
- Run `pnpm check` and `pnpm build` before finishing. Run the existing tests when relevant.
- Do not add tests or code comments unless explicitly requested.
- Use braces for every control-flow block, guard clauses for early exits, and no nested ternaries.
- Maximum control-flow depth is 3. The cyclomatic complexity limit is 10; split larger functions.
- Prefer `const`, named intermediate values, and object shorthand. Avoid mutable state when a clear helper or collection operation works.
- Assign awaited results before using them in other expressions.
- Keep functions focused. Extract substantial callbacks when it improves clarity.
- Do not add speculative abstractions or refactor unrelated code.
- Let Oxfmt determine formatting. Use `pnpm format` on files affected by the task.
- For complexity-focused refactors, measure before and after, report hotspots before editing, and finish with a concise complexity/depth report and verification results.
