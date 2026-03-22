---
title: Instructions
nav_order: 4
description: repo root に置く instruction template の一覧
---

このページは、repo root の `instructions/*.instructions.md` を見つけやすくするための index です。Pages では一覧だけを持ち、本文は GitHub 上の source file を開いて確認します。

| Instruction | 役割 | 主な適用対象 | Source |
| --- | --- | --- | --- |
| `aspnetcore-mvc.instructions.md` | ASP.NET Core MVC の Controller / Service / ViewModel / View の責務分離を常時ルールとして渡す | `Controllers/**/*.cs`, `Services/**/*.cs`, `ViewModels/**/*.cs`, `Views/**/*.cshtml` | [instructions/aspnetcore-mvc.instructions.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/aspnetcore-mvc.instructions.md) |
| `dotnet-modernization.instructions.md` | WebForms / WinForms から ASP.NET Core MVC へ移る案件で、small slice、TDD、MVC 切り替え、Data Access 境界を常時ルールとして渡す | `Controllers/**/*.cs`, `Services/**/*.cs`, `UseCases/**/*.cs`, `Repositories/**/*.cs`, `Data/**/*.cs`, `ViewModels/**/*.cs`, `Views/**/*.cshtml` | [instructions/dotnet-modernization.instructions.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/dotnet-modernization.instructions.md) |
| `memory-bank.instructions.md` | `memory-bank/**/*.md` に durable context を残す書き方を常時ルールとして渡す | `memory-bank/**/*.md` | [instructions/memory-bank.instructions.md](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/memory-bank.instructions.md) |

## 使い分け

- instruction は file-specific な常時ルールです
- 長い対話や比較判断は [Agents](../agents/) に寄せます
- 手順の繰り返し適用は [Skills](../skills/) に寄せます
