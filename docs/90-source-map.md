---
title: Source Map
nav_order: 7
description: 採用ソースの台帳
---

このページは、このリポジトリで参照した外部ソースを管理するための台帳です。カテゴリページには、ここで `採用` になっている項目だけを載せます。

## ステータスの意味

- `採用`: 現在の docs に掲載する
- `保留`: 有用だが現時点の範囲外、または優先度を下げる
- `除外`: 現在の軸から外れるため採用しない

## 採用済みソース

| ID | 元 URL / 元 repo | リソース種別 | 採用 / 保留 / 除外 | 採用理由 | 掲載先ページ | 最終確認日 |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | [github/awesome-copilot: csharp.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/csharp.instructions.md) | Instruction | 採用 | C# の基本線を最初に固定しやすい | [10-csharp-dotnet](10-csharp-dotnet.md) | 2026-03-20 |
| C02 | [github/awesome-copilot: dotnet-architecture-good-practices.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/dotnet-architecture-good-practices.instructions.md) | Instruction | 採用 | MVC でも通用する設計上の guardrail を補強できる | [10-csharp-dotnet](10-csharp-dotnet.md) | 2026-03-20 |
| C03 | [github/awesome-copilot: dotnet-best-practices/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/dotnet-best-practices/SKILL.md) | Skill | 採用 | .NET の判断単位を skill として再利用しやすい | [10-csharp-dotnet](10-csharp-dotnet.md) | 2026-03-20 |
| C04 | [github/awesome-copilot: expert-dotnet-software-engineer.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/expert-dotnet-software-engineer.agent.md) | Agent | 採用 | 設計や改善相談の受け皿として相性がよい | [10-csharp-dotnet](10-csharp-dotnet.md) | 2026-03-20 |
| M01 | [Microsoft Learn: ASP.NET Core MVC の概要](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/overview?view=aspnetcore-9.0) | Official Docs | 採用 | MVC の用語と構成を揃える起点になる | [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | 2026-03-20 |
| M02 | [Microsoft Learn: Controllers, actions, and action results](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/controllers/actions?view=aspnetcore-9.0) | Official Docs | 採用 | Controller の責務分離を説明しやすい | [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | 2026-03-20 |
| M03 | [Microsoft Learn: Model binding in ASP.NET Core](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0) | Official Docs | 採用 | 入力処理と ViewModel 境界の説明に直結する | [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | 2026-03-20 |
| M04 | [Microsoft Learn: Views in ASP.NET Core MVC](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/views/overview?view=aspnetcore-9.0) | Official Docs | 採用 | Razor View の責務整理に使いやすい | [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | 2026-03-20 |
| U01 | [github/awesome-copilot: csharp-xunit/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-xunit/SKILL.md) | Skill | 採用 | v1 の第一候補テストフレームワークとして扱う | [30-testing-unit](30-testing-unit.md) | 2026-03-20 |
| U02 | [github/awesome-copilot: csharp-nunit/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-nunit/SKILL.md) | Skill | 採用 | 既存チームの代替フレームワーク需要に対応できる | [30-testing-unit](30-testing-unit.md) | 2026-03-20 |
| U03 | [github/awesome-copilot: csharp-mstest/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-mstest/SKILL.md) | Skill | 採用 | 既存組織標準を崩さずに導入できる | [30-testing-unit](30-testing-unit.md) | 2026-03-20 |
| U04 | [Microsoft Learn: Unit testing best practices](https://learn.microsoft.com/ja-jp/dotnet/core/testing/unit-testing-best-practices) | Official Docs | 採用 | フレームワーク非依存で粒度と保守性を揃えられる | [30-testing-unit](30-testing-unit.md) | 2026-03-20 |
| U05 | [Microsoft Learn: Test controller logic in ASP.NET Core](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/controllers/testing?view=aspnetcore-9.0) | Official Docs | 採用 | MVC Controller テストの入口として適切 | [30-testing-unit](30-testing-unit.md) | 2026-03-20 |
| U06 | [Microsoft Learn: Integration tests in ASP.NET Core](https://learn.microsoft.com/ja-jp/aspnet/core/test/integration-tests?view=aspnetcore-9.0) | Official Docs | 採用 | アプリ結線込みの検証に接続できる | [30-testing-unit](30-testing-unit.md) | 2026-03-20 |
| E01 | [github/awesome-copilot: playwright-dotnet.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/playwright-dotnet.instructions.md) | Instruction | 採用 | Playwright for .NET の基準線として使いやすい | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 2026-03-20 |
| E02 | [github/awesome-copilot: playwright-explore-website/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/playwright-explore-website/SKILL.md) | Skill | 採用 | 既存画面の探索から E2E 化へつなげやすい | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 2026-03-20 |
| E03 | [github/awesome-copilot: playwright-generate-test/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/playwright-generate-test/SKILL.md) | Skill | 採用 | シナリオからテストのたたき台を起こしやすい | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 2026-03-20 |
| E04 | [github/awesome-copilot: playwright-tester.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/playwright-tester.agent.md) | Agent | 採用 | 探索や E2E 相談をまとめて受けられる | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 2026-03-20 |
| E05 | [Playwright Docs: Introduction](https://playwright.dev/dotnet/docs/intro) | Official Docs | 採用 | Playwright for .NET の基本確認に必要 | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 2026-03-20 |
| E06 | [Playwright Docs: Locators](https://playwright.dev/dotnet/docs/locators) | Official Docs | 採用 | 壊れにくい E2E の説明に必須 | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 2026-03-20 |
| A01 | [github/awesome-copilot: github-actions-ci-cd-best-practices.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md) | Instruction | 採用 | workflow 設計時の guardrail として使いやすい | [50-github-actions](50-github-actions.md) | 2026-03-20 |
| A02 | [github/awesome-copilot: github-actions-expert.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/github-actions-expert.agent.md) | Agent | 採用 | Actions の改善相談を一段深く進めやすい | [50-github-actions](50-github-actions.md) | 2026-03-20 |
| A03 | [GitHub Docs: Building and testing .NET](https://docs.github.com/ja/actions/automating-builds-and-tests/building-and-testing-net) | Official Docs | 採用 | `.NET test` を CI に載せる最小構成として適切 | [50-github-actions](50-github-actions.md) | 2026-03-20 |
| A04 | [GitHub Docs: Using a matrix for your jobs](https://docs.github.com/ja/actions/using-jobs/using-a-matrix-for-your-jobs) | Official Docs | 採用 | .NET バージョンや OS の確認を段階的に増やせる | [50-github-actions](50-github-actions.md) | 2026-03-20 |
| A05 | [GitHub Docs: Use GITHUB_TOKEN in workflows](https://docs.github.com/ja/actions/tutorials/use-github_token-in-workflows) | Official Docs | 採用 | 権限最小化の基本線として必要 | [50-github-actions](50-github-actions.md) | 2026-03-20 |
| P01 | [VS Code Docs: Agent plugins in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) | Official Docs | 採用 | plugin の導入、Git URL からのインストール、管理方法の基本線として必要 | [60-agent-plugins](60-agent-plugins.md) | 2026-03-20 |
| P02 | [VS Code Docs: Use Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills) | Official Docs | 採用 | skill の frontmatter、配置、読み込み方を plugin 配布へ移す基準になる | [60-agent-plugins](60-agent-plugins.md) | 2026-03-20 |
| P03 | [VS Code Docs: Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) | Official Docs | 採用 | agent の tools 制限と役割分離を決める基準として使える | [60-agent-plugins](60-agent-plugins.md) | 2026-03-20 |
| P04 | [GitHub Docs: Creating a plugin for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating) | Official Docs | 採用 | `plugin.json` と plugin directory structure の最小要件を確認できる | [60-agent-plugins](60-agent-plugins.md) | 2026-03-20 |
| S01 | [GitHub Docs: Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) | Official Docs | 採用 | starter repo の `.github/copilot-instructions.md` と path-specific instructions の切り分け基準を確認できる | [71-github-copilot-starter](71-github-copilot-starter.md) | 2026-03-21 |
| S02 | [VS Code Docs: Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) | Official Docs | 採用 | starter に含める `.github/agents/*.agent.md` の役割と frontmatter の基本線を確認できる | [71-github-copilot-starter](71-github-copilot-starter.md) | 2026-03-21 |
| S03 | [VS Code Docs: Use Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills) | Official Docs | 採用 | skill 本文から `assets/` と `references/` を案内する plugin 構成を整理できる | [71-github-copilot-starter](71-github-copilot-starter.md) | 2026-03-21 |
| S04 | [GitHub Docs: Creating a plugin for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating) | Official Docs | 採用 | starter plugin 自体の `plugin.json` と directory structure の最小要件を確認できる | [71-github-copilot-starter](71-github-copilot-starter.md) | 2026-03-21 |
| D01 | [Microsoft Learn: How to upgrade a .NET app with GitHub Copilot modernization](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/how-to-upgrade-with-github-copilot) | Official Docs | 採用 | `assessment / plan / tasks` の staged workflow を spec-driven な shared handoff に寄せる発想を確認できる | [72-spec-driven-workflow](72-spec-driven-workflow.md) | 2026-03-21 |
| D02 | [GitHub Docs: Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) | Official Docs | 採用 | spec-driven workflow でも repo-wide rule と file-specific rule を分ける境界を確認できる | [72-spec-driven-workflow](72-spec-driven-workflow.md) | 2026-03-21 |
| T01 | [Microsoft Learn: Unit testing best practices](https://learn.microsoft.com/ja-jp/dotnet/core/testing/unit-testing-best-practices) | Official Docs | 採用 | implementation detail ではなく behavior と failure mode を守るテスト観点を確認できる | [74-polyglot-test-integrity](74-polyglot-test-integrity.md) | 2026-03-21 |
| T02 | [Playwright Docs: Locators](https://playwright.dev/dotnet/docs/locators) | Official Docs | 採用 | brittle な selector や implementation-friendly な UI test を避ける観点を補強できる | [74-polyglot-test-integrity](74-polyglot-test-integrity.md) | 2026-03-21 |
| C05 | [github/awesome-copilot: expert-dotnet-software-engineer.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/expert-dotnet-software-engineer.agent.md) | Agent | 採用 | C# / .NET の expert agent を separate plugin として再編する起点になる | [75-csharp-expert](75-csharp-expert.md) | 2026-03-21 |
| C06 | [Microsoft Learn: SQL クエリ - EF Core](https://learn.microsoft.com/ja-jp/ef/core/querying/sql-queries) | Official Docs | 採用 | EF Core を既定にしつつ raw SQL / stored procedure を例外採用する境界を .NET expert guidance でも使える | [75-csharp-expert](75-csharp-expert.md) | 2026-03-21 |
| W07 | [GitHub Docs: Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions) | Official Docs | 採用 | workflow YAML の observed behavior を spec 化するときの trigger、jobs、permissions の読み取り基準になる | [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md) | 2026-03-21 |
| W08 | [GitHub Docs: Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data) | Official Docs | 採用 | workflow spec と broad CI/CD policy で artifact の役割と受け渡しを整理しやすい | [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md) | 2026-03-21 |
| W09 | [GitHub Docs: Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) | Official Docs | 採用 | environment protection、promotion、rollback を broad CI/CD policy へ落とす基準になる | [76-github-actions-cicd-best-practices](76-github-actions-cicd-best-practices.md) | 2026-03-21 |
| W01 | [github/awesome-copilot](https://github.com/github/awesome-copilot) | Repo | 採用 | repo root に `agents/` `skills/` `instructions/` `docs/` を置く公開構成の基準として使える | [70-github-pages-catalog](70-github-pages-catalog.md) | 2026-03-21 |
| W02 | [GitHub Docs: Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) | Official Docs | 採用 | `main:/docs` を Pages source にする branch publish 前提を確認できる | [70-github-pages-catalog](70-github-pages-catalog.md) | 2026-03-21 |
| W03 | [Jekyll Docs: Front Matter](https://jekyllrb.com/docs/front-matter/) | Official Docs | 採用 | `docs/` 配下の Markdown を page として扱うために front matter が必要なことを確認できる | [70-github-pages-catalog](70-github-pages-catalog.md) | 2026-03-21 |
| W04 | [Just the Docs: Configuration](https://just-the-docs.github.io/just-the-docs/docs/configuration/) | Official Docs | 採用 | `_config.yml` で search、aux links、heading anchors、footer をどう持たせるか確認できる | [70-github-pages-catalog](70-github-pages-catalog.md) | 2026-03-21 |
| W05 | [Just the Docs: Ordering Pages](https://just-the-docs.github.io/just-the-docs/docs/navigation/main/order/) | Official Docs | 採用 | `nav_order` と parent 構成で guide と index を並べる基準になる | [70-github-pages-catalog](70-github-pages-catalog.md) | 2026-03-21 |
| W06 | [Just the Docs: Search](https://just-the-docs.github.io/just-the-docs/docs/search/) | Official Docs | 採用 | 標準 search だけで discovery を成立させ、独自 filter を持たない方針の根拠になる | [70-github-pages-catalog](70-github-pages-catalog.md) | 2026-03-21 |
| L01 | [github/awesome-copilot: dotnet-upgrade.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/dotnet-upgrade.agent.md) | Agent | 採用 | 現行 repo の棚卸し、依存順序、small step の移行順を考える入口として使える | [80-modernization](80-modernization.md) | 2026-03-21 |
| L02 | [github/awesome-copilot: dotnet-framework.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/dotnet-framework.instructions.md) | Instruction | 採用 | 現行 .NET Framework / WinForms / WebForms 側の制約を読むときの guardrail として使える | [80-modernization](80-modernization.md) | 2026-03-21 |
| L03 | [Microsoft Learn: SQL クエリ - EF Core](https://learn.microsoft.com/ja-jp/ef/core/querying/sql-queries) | Official Docs | 採用 | EF Core を基本にしつつ、SQL / stored procedure を例外採用する境界と注意点を確認できる | [80-modernization](80-modernization.md) | 2026-03-21 |
| L04 | [github/awesome-copilot: ef-core/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/ef-core/SKILL.md) | Skill | 採用 | 次世代側の EF Core 実装基準を skill 単位で補強できる | [80-modernization](80-modernization.md) | 2026-03-21 |
| R01 | [GitHub Docs: About GitHub Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review) | Official Docs | 採用 | code review の提供範囲、quota、人手レビュー前提を整理する起点になる | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| R02 | [GitHub Docs: Using GitHub Copilot code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review) | Official Docs | 採用 | GitHub.com や IDE で review を起動する導線を確認できる | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| R03 | [GitHub Docs: Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) | Official Docs | 採用 | review 用の custom instructions と `excludeAgent` の使い分けを整理できる | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| R04 | [GitHub Docs: Requesting a code review with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/agentic-code-review) | Official Docs | 採用 | commit 前のローカル差分 review を段階化しやすい | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| R05 | [Microsoft Learn: GitHub Copilot modernization overview](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/overview) | Official Docs | 採用 | ASP.NET Core MVC を含む modernization の現行主導線として適切 | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| R06 | [Microsoft Learn: How to upgrade a .NET app with GitHub Copilot modernization](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/how-to-upgrade-with-github-copilot) | Official Docs | 採用 | `.github/upgrades` を使う 3 段階 workflow を確認できる | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| R07 | [Microsoft Learn: Apply custom upgrade instructions for .NET upgrades](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/how-to-custom-upgrade-instructions) | Official Docs | 採用 | 反復的な API / package 置換を instruction 化して再利用しやすい | [70-agents-and-review](70-agents-and-review.md) | 2026-03-21 |
| J01 | [github/awesome-copilot: mentoring-juniors/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/mentoring-juniors/SKILL.md) | Skill | 採用 | 質問で導く mentoring 手順と progressive clue の考え方を転用しやすい | [70-modernization-mentoring](70-modernization-mentoring.md) | 2026-03-20 |
| J02 | [github/awesome-copilot: mentoring-juniors.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/mentoring-juniors.agent.md) | Agent | 採用 | `Sensei` の人格と、説明なき解答禁止の guardrail を参照しやすい | [70-modernization-mentoring](70-modernization-mentoring.md) | 2026-03-20 |
| J03 | [Anthropic: Introducing Claude for Education](https://www.anthropic.com/news/introducing-claude-for-education) | Official Docs | 採用 | 2025-04-02 公開の Learning mode にある Socratic questioning の考え方を確認できる | [70-modernization-mentoring](70-modernization-mentoring.md) | 2026-03-20 |

## 保留 / 除外

| ID | 元 URL / 元 repo | リソース種別 | 採用 / 保留 / 除外 | 採用理由 | 掲載先ページ | 最終確認日 |
| --- | --- | --- | --- | --- | --- | --- |
| H01 | [github/awesome-copilot: aspnet-rest-apis.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/aspnet-rest-apis.instructions.md) | Instruction | 除外 | API 中心で、現在の MVC ビュー責務整理から外れる | - | 2026-03-20 |
| H02 | [github/awesome-copilot: csharp-tunit/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-tunit/SKILL.md) | Skill | 保留 | テスト選択肢としては有用だが、現時点では xUnit / NUnit / MSTest を優先する | - | 2026-03-20 |

## 運用ルール

1. 新しいソースを検討したら、先にこのページへ行を追加する
2. `採用` にした項目だけをカテゴリページへ反映する
3. `最終確認日` は URL 到達性と内容確認をした日に更新する
