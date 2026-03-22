# Awesome Copilot JA for .NET MVC

`github/awesome-copilot` の repo 構成に寄せつつ、日本語中心で agent / skill / instruction / plugin を配布する marketplace repo です。ASP.NET Core MVC、C# / .NET、GitHub Copilot bootstrap、shared workflow、テスト品質、GitHub Actions、modernization guidance を plugin 単位で公開します。

## 目的

- GitHub Copilot 向けの `agents/` `skills/` `instructions/` を repo root に整理する
- `plugins/` では install 単位の declarative package を管理する
- GitHub Pages では `docs/` をそのまま公開し、必要な resource を discovery できるようにする
- `staged` を編集用、`main` を publish 用の branch として使い分ける

## ディレクトリ構成

```text
repo-root/
├─ agents/
│  └─ *.agent.md
├─ skills/
│  └─ <skill-id>/
│     ├─ SKILL.md
│     ├─ references/
│     └─ assets/
├─ instructions/
│  └─ *.instructions.md
├─ plugins/
│  └─ <plugin-id>/
│     ├─ .github/plugin/plugin.json
│     └─ README.md
├─ .github/
│  ├─ plugin/marketplace.json
│  └─ workflows/
├─ docs/
└─ website/  # legacy implementation, not the active Pages source
```

- `agents/`, `skills/`, `instructions/` が `staged` の正本です
- `plugins/<plugin-id>/.github/plugin/plugin.json` は、どの skill / agent を同梱するかを宣言します
- `main` への publish 時に `eng/materialize-plugins.mjs` が plugin 配下へ配布物を生成します
- GitHub Pages は `main:/docs` を source にする前提です

## 運用モデル

| branch | 役割 |
| --- | --- |
| `staged` | 編集用の正本。plugin は宣言型 manifest のみを持つ |
| `main` | publish workflow が生成した配布 branch。plugin 配下に materialized payload を含む |

workflow の役割:

- [`.github/workflows/docs-quality.yml`](.github/workflows/docs-quality.yml): `staged` の lint / link / Jekyll build validation
- [`.github/workflows/check-plugin-structure.yml`](.github/workflows/check-plugin-structure.yml): plugin directory が declarative layout を保っているか確認
- [`.github/workflows/check-pr-target.yml`](.github/workflows/check-pr-target.yml): `main` 宛て PR を reject
- [`.github/workflows/publish.yml`](.github/workflows/publish.yml): `staged` push から materialized `main` を publish

## 主な plugin

| Plugin | 含まれる resource |
| --- | --- |
| `csharp-dotnet-coding-baseline-guidance` | `csharp-dotnet-coding-baseline-guidance` |
| `csharp-dotnet-architecture-expert-guidance` | `csharp-dotnet-architecture-expert-guidance`, `csharp-dotnet-expert` |
| `aspnetcore-mvc-app-guidance` | `aspnetcore-mvc-app-guidance`, `aspnetcore-mvc-guide` |
| `aspnetcore-mvc-test-strategy-guidance` | `aspnetcore-mvc-test-strategy-guidance` |
| `dotnet-playwright-ci-guidance` | `dotnet-playwright-ci-guidance` |
| `github-actions-delivery-policy-guidance` | `github-actions-delivery-policy-guidance` |
| `github-actions-workflow-spec-guidance` | `github-actions-workflow-spec-guidance` |
| `github-copilot-repo-bootstrap-guidance` | `github-copilot-repo-bootstrap-guidance` |
| `memory-bank-shared-workflow-guidance` | `memory-bank-shared-workflow-guidance` |
| `behavior-first-test-integrity-guidance` | `behavior-first-test-integrity-guidance`, `polyglot-test-agent` |
| `dotnet-modernization-guidance` | `dotnet-modernization-slice-guidance`, `dotnet-modernization-socratic-mentoring`, `modernization-modernizer`, `sensei-modernization-mentor` |
| `custom-agent-creator-guidance` | `custom-agent-creator` |

## ローカル検証

```powershell
npm run plugin:validate
npm run plugin:generate-marketplace
npx markdownlint-cli2 README.md "docs/**/*.md" "examples/**/*.md" "agents/**/*.md" "skills/**/*.md" "instructions/**/*.md" "plugins/**/*.md"
powershell -File scripts/check-links.ps1 README.md "docs/**/*.md" "examples/**/*.md" "agents/**/*.md" "skills/**/*.md" "instructions/**/*.md" "plugins/**/*.md"
git diff --check
```

Jekyll build は GitHub Actions の `docs-quality` で検証します。local で preview したい場合は、Ruby / Bundler を用意したうえで `docs/` を Jekyll として起動してください。

publish 出力をローカルで確認したい場合は、作業ツリーではなく別 clone か一時 worktree で `npm run plugin:materialize` を実行してください。`staged` の作業ツリーには materialized `plugins/*/skills` と `plugins/*/agents` を残しません。

## 読み順

- [Home](docs/index.md)
- [Overview](docs/01-overview.md)
- [Agent Plugins](docs/60-agent-plugins.md)
- [GitHub Pages Catalog](docs/70-github-pages-catalog.md)
- [Custom Agents](docs/README.agents.md)
- [Modernization Mentoring](docs/70-modernization-mentoring.md)
- [GitHub Copilot Starter](docs/71-github-copilot-starter.md)
- [Source Map](docs/90-source-map.md)

## 利用側の導線

end-user は marketplace URL を `chat.plugins.marketplaces` に登録し、`@agentPlugins` から install します。maintainer や advanced user が source checkout を直接試す場合だけ、materialize 済み plugin directory を `chat.pluginLocations` に登録してください。

公開 metadata は [`.github/plugin/marketplace.json`](.github/plugin/marketplace.json) を参照し、公開 docs site は `docs/` と GitHub Pages branch publish で生成します。移行後は repository Settings > Pages を `Deploy from a branch` / `main` / `/docs` に設定してください。
