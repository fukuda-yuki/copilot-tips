# Repository Guidelines

## Project Structure & Module Organization

This repository is a documentation and plugin marketplace project, not a runnable MVC app. Keep primary content in:

- `docs/`: numbered guidance pages such as `01-overview.md` and `60-agent-plugins.md`
- `skills/`: staged branch source of truth for reusable skill packages
- `agents/`: staged branch source of truth for reusable agent definitions
- `instructions/`: staged branch source of truth for reusable instruction templates
- `plugins/<plugin-id>/`: declarative plugin packages on `staged`, each with `README.md` and `.github/plugin/plugin.json`
- `.github/plugin/marketplace.json`: marketplace manifest that lists every published plugin and version
- `examples/`: sample CI workflow templates and small supporting examples
- `memory-bank/`: planning notes; avoid changing these unless the task explicitly targets them

## Build, Test, and Development Commands

There is no repo-wide `.NET` build. The `dotnet` commands under `examples/workflows/dotnet-test-playwright.yml` are templates for downstream projects.

- `npm run plugin:validate`: verify `staged` keeps declarative plugin manifests and no materialized plugin payloads
- `npm run plugin:generate-marketplace`: regenerate `.github/plugin/marketplace.json` from plugin manifests
- `npx markdownlint-cli2 README.md "docs/**/*.md" "examples/**/*.md" "agents/**/*.md" "skills/**/*.md" "instructions/**/*.md" "plugins/**/*.md"`: mirror the Markdown lint job
- `powershell -File scripts/check-links.ps1 README.md "docs/**/*.md" "examples/**/*.md" "agents/**/*.md" "skills/**/*.md" "instructions/**/*.md" "plugins/**/*.md"`: mirror the link-check job locally
- `git diff --check`: catch trailing whitespace and malformed patch output before opening a PR

If you edit `skills/**/SKILL.md`, `agents/**/*.md`, or `instructions/**/*.md`, run the same lint and PowerShell link checks against those files manually.

## Coding Style & Naming Conventions

Use Markdown headings with short, scannable sections. Keep prose direct and Japanese-first when editing existing docs, while leaving technical identifiers in English. Follow existing filename patterns:

- docs: numeric prefixes, for example `30-testing-unit.md`
- plugins, skills, and agents: kebab-case IDs, for example `aspnetcore-mvc-app-guidance`
- JSON: 2-space indentation

Line length is intentionally flexible because `.markdownlint.jsonc` disables `MD013`.

## Testing Guidelines

Validation is content-focused:

- run Markdown lint and link checks for any docs, examples, or plugin text changes
- when editing `plugins/**/.github/plugin/plugin.json`, verify the plugin version matches `.github/plugin/marketplace.json`
- when changing plugin composition, run `npm run plugin:validate` and `npm run plugin:generate-marketplace`
- when changing docs navigation or Pages settings under `docs/`, ensure the Jekyll build in `.github/workflows/docs-quality.yml` still passes
- when editing workflow examples, keep placeholder paths and `dotnet` steps internally consistent

## Agent Execution Guidelines

When working in this repository, prefer aggressive delegation and iterative refinement over one-pass analysis:

- proactively delegate tasks that can be offloaded to Subagents, especially external research such as investigating `https://github.com/github/awesome-copilot`
- do not stop after initial analysis or research; continue through evaluation, revision, and rework as many times as needed to improve the result
- treat time as a secondary constraint; prioritize completeness, verification, and quality of the final output
- when Subagents return results, review their output critically and refine or rerun follow-up work if the findings are incomplete or weak

## Commit & Pull Request Guidelines

Recent history favors short, imperative subjects, sometimes with a scope prefix such as `docs:`. Prefer formats like:

- `docs: add skill creator checklist`
- `Refactor plugin structure for marketplace distribution`

PRs should state the affected area (`docs`, `plugins`, `examples`, or marketplace metadata), summarize user-visible changes, and link any related issue. Include rendered screenshots only when a README or documentation layout change is easier to review visually.
