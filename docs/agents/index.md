---
title: Agents
nav_order: 2
has_children: true
description: 使いたい agent を docs 側から探すための一覧
---

このページは、repo root の `agents/*.agent.md` を人間向けに探しやすくするための index です。Pages 上では discovery だけを担い、詳細本文は GitHub 上の source file を開いて確認します。

| Agent | 役割 | 関連 plugin | Source |
| --- | --- | --- | --- |
| `aspnetcore-mvc-guide` | ASP.NET Core MVC の実装方針やレビュー観点を整理し、迷いやすい判断を日本語で相談できる agent | [Plugins](../plugins/) | [agents/aspnetcore-mvc-guide.agent.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/agents/aspnetcore-mvc-guide.agent.md) |
| `csharp-dotnet-expert` | C# / .NET の設計、async / await、DI、CQRS、SOLID、テスト、性能改善、EF Core 中心のデータアクセス判断を深く整理する agent | [Plugins](../plugins/) | [agents/csharp-dotnet-expert.agent.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/agents/csharp-dotnet-expert.agent.md) |
| `custom-agent-creator` | GitHub Copilot の custom agent を日本語で設計し、作成し、見直す agent | [Plugins](../plugins/) | [agents/custom-agent-creator.agent.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/agents/custom-agent-creator.agent.md) |
| `modernization-modernizer` | Legacy WebForms / WinForms から ASP.NET Core MVC へ移行する計画、責務分離、テスト戦略、段階的な実装方針を整理する agent | [Plugins](../plugins/) | [agents/modernization-modernizer.agent.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/agents/modernization-modernizer.agent.md) |
| `polyglot-test-agent` | 振る舞いベースでテスト案を見直し、実装に寄りすぎたテストや弱い assertion を指摘する agent | [Plugins](../plugins/) | [agents/polyglot-test-agent.agent.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/agents/polyglot-test-agent.agent.md) |
| `sensei-modernization-mentor` | 現行の WebForms / WinForms の仕様を聞き取り、ASP.NET Core MVC への移行方針を質問ベースで整理する mentoring agent | [Plugins](../plugins/) | [agents/sensei-modernization-mentor.agent.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/agents/sensei-modernization-mentor.agent.md) |

## 関連ページ

- custom agent の考え方は [Custom Agents](../README.agents.md) を参照してください
- install 単位は [Plugins](../plugins/) で確認してください
