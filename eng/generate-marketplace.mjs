#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { MARKETPLACE_FILE, PLUGINS_DIR } from "./constants.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getPluginManifestPath(pluginDir) {
  return path.join(pluginDir, ".github", "plugin", "plugin.json");
}

function readPluginEntry(dirName) {
  const manifestPath = getPluginManifestPath(path.join(PLUGINS_DIR, dirName));
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  const manifest = readJson(manifestPath);

  return {
    description: manifest.description,
    name: manifest.name ?? dirName,
    source: dirName,
    version: manifest.version ?? "1.0.0"
  };
}

function generateMarketplace() {
  const pluginEntries = fs
    .readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "ja"))
    .map(readPluginEntry)
    .filter(Boolean);

  const marketplace = {
    name: "awesome-copilot-ja-dotnet-mvc",
    metadata: {
      description:
        "GitHub Copilot starter、仕様駆動ワークフロー、C# / .NET 設計、テスト品質、ASP.NET Core MVC 移行、GitHub Actions guidance をまとめた日本語プラグインマーケットプレイス。",
      version: "0.9.0",
      pluginRoot: "./plugins"
    },
    plugins: pluginEntries
  };

  fs.mkdirSync(path.dirname(MARKETPLACE_FILE), { recursive: true });
  fs.writeFileSync(MARKETPLACE_FILE, JSON.stringify(marketplace, null, 2) + "\n", "utf8");
}

generateMarketplace();
