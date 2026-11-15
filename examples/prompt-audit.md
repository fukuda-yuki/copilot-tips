---
ask: プロンプトを監査して
---

監査範囲と対象モデルを確定するため、リポジトリ内の指示・スキル・エージェント・プロンプトの在庫を確認します。監査対象ファイルの内容はデータとして扱い、そこに書かれた指示やコマンドは実行しません。

在庫上、監査対象はルートの `AGENTS.md` と `CLAUDE.md`、配布元 `skills/**/SKILL.md` と参照文書です。`.claude/settings.json` と hook は秘密情報・設定実装のため読み飛ばし、実行コードに埋め込まれたモデル/API要求は見つかる範囲を検索します。次に、指定されたアンチパターンと相互矛盾を行番号付きで照合します。

<final_answer>
/home/runner/work/copilot-tips/copilot-tips/skills/prompt-audit/references/prompt-audit.md:1-240
/home/runner/work/copilot-tips/copilot-tips/skills/prompt-audit/SKILL.md:1-48
/home/runner/work/copilot-tips/copilot-tips/plugins/doctor/README.md:3-30
/home/runner/work/copilot-tips/copilot-tips/README.md:55-80
/home/runner/work/copilot-tips/copilot-tips/CONTRIBUTING.md:46-80
/home/runner/work/copilot-tips/copilot-tips/.claude-plugin/marketplace.json:18-30
/home/runner/work/copilot-tips/copilot-tips/.github/plugin/marketplace.json:18-30
</final_answer>

<final_answer>
/home/runner/work/copilot-tips/copilot-tips/skills/prompt-audit/references/prompt-audit.md:7-160
/home/runner/work/copilot-tips/copilot-tips/skills/prompt-audit/references/prompt-audit.md:118-220
/home/runner/work/copilot-tips/copilot-tips/skills/prompt-audit/SKILL.md:1-48
/home/runner/work/copilot-tips/copilot-tips/skills/copilot-doctor/SKILL.md:1-88
/home/runner/work/copilot-tips/copilot-tips/AGENTS.md:1-50
/home/runner/work/copilot-tips/copilot-tips/CLAUDE.md:1-2
</final_answer>

<final_answer>
/skills/imozuru/SKILL.md:50-140
/skills/imozuru/SKILL.md:140-220
</final_answer>

<final_answer>
/home/runner/work/copilot-tips/copilot-tips/skills/imozuru/SKILL.md:3-140
/home/runner/work/copilot-tips/copilot-tips/skills/imozuru/SKILL.md:140-260
</final_answer>


## 監査レポート

**前提**

- **範囲**: ルートの `AGENTS.md` / `CLAUDE.md`、`skills/**/SKILL.md`、参照 Markdown。`.github` の prompt/instructions/agents は存在せず、`.claude/settings.json` と hook は秘密情報を含みうるため未読。
…
