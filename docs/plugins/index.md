---
title: Plugins
nav_order: 5
description: install 単位の plugin 一覧
---

このページは、marketplace から install する単位としての plugin を一覧化したものです。plugin の正本は `plugins/<plugin-id>/.github/plugin/plugin.json` と `plugins/<plugin-id>/README.md` です。

## Plugin Catalog

| Plugin | Version | 同梱物 | README |
| --- | --- | --- | --- |
| `aspnetcore-mvc-app-guidance` | `0.1.0` | skill: `aspnetcore-mvc-app-guidance`, agent: `aspnetcore-mvc-guide` | [plugins/aspnetcore-mvc-app-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/aspnetcore-mvc-app-guidance/README.md) |
| `aspnetcore-mvc-test-strategy-guidance` | `0.1.0` | skill: `aspnetcore-mvc-test-strategy-guidance` | [plugins/aspnetcore-mvc-test-strategy-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/aspnetcore-mvc-test-strategy-guidance/README.md) |
| `behavior-first-test-integrity-guidance` | `0.1.0` | skill: `behavior-first-test-integrity-guidance`, agent: `polyglot-test-agent` | [plugins/behavior-first-test-integrity-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/behavior-first-test-integrity-guidance/README.md) |
| `csharp-dotnet-coding-baseline-guidance` | `0.1.0` | skill: `csharp-dotnet-coding-baseline-guidance` | [plugins/csharp-dotnet-coding-baseline-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/csharp-dotnet-coding-baseline-guidance/README.md) |
| `csharp-dotnet-architecture-expert-guidance` | `0.1.0` | skill: `csharp-dotnet-architecture-expert-guidance`, agent: `csharp-dotnet-expert` | [plugins/csharp-dotnet-architecture-expert-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/csharp-dotnet-architecture-expert-guidance/README.md) |
| `custom-agent-creator-guidance` | `0.2.0` | agent: `custom-agent-creator` | [plugins/custom-agent-creator-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/custom-agent-creator-guidance/README.md) |
| `dotnet-modernization-guidance` | `0.1.0` | skills: `dotnet-modernization-slice-guidance`, `dotnet-modernization-socratic-mentoring`; agents: `modernization-modernizer`, `sensei-modernization-mentor` | [plugins/dotnet-modernization-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/dotnet-modernization-guidance/README.md) |
| `dotnet-playwright-ci-guidance` | `0.1.0` | skill: `dotnet-playwright-ci-guidance` | [plugins/dotnet-playwright-ci-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/dotnet-playwright-ci-guidance/README.md) |
| `github-actions-delivery-policy-guidance` | `0.1.0` | skill: `github-actions-delivery-policy-guidance` | [plugins/github-actions-delivery-policy-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/github-actions-delivery-policy-guidance/README.md) |
| `github-actions-workflow-spec-guidance` | `0.2.0` | skill: `github-actions-workflow-spec-guidance` | [plugins/github-actions-workflow-spec-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/github-actions-workflow-spec-guidance/README.md) |
| `github-copilot-repo-bootstrap-guidance` | `0.1.0` | skill: `github-copilot-repo-bootstrap-guidance` | [plugins/github-copilot-repo-bootstrap-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/github-copilot-repo-bootstrap-guidance/README.md) |
| `memory-bank-shared-workflow-guidance` | `0.1.0` | skill: `memory-bank-shared-workflow-guidance` | [plugins/memory-bank-shared-workflow-guidance/README.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/plugins/memory-bank-shared-workflow-guidance/README.md) |

## Install の考え方

- end-user は marketplace から plugin 単位で install します
- docs では discovery を助け、実際の install 単位は plugin に戻します
- marketplace metadata の基準は [`.github/plugin/marketplace.json`](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/.github/plugin/marketplace.json) です
