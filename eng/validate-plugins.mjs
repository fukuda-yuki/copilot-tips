#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { AGENTS_DIR, PLUGINS_DIR, SKILLS_DIR } from "./constants.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function directoryHasEntries(dirPath) {
  return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
}

function validatePluginDir(pluginDir, errors) {
  const pluginId = path.basename(pluginDir);
  const manifestPath = path.join(pluginDir, ".github", "plugin", "plugin.json");
  const legacyManifestPath = path.join(pluginDir, "plugin.json");
  const readmePath = path.join(pluginDir, "README.md");

  assert(fs.existsSync(manifestPath), `${pluginId}: missing .github/plugin/plugin.json`, errors);
  assert(fs.existsSync(readmePath), `${pluginId}: missing README.md`, errors);
  assert(!fs.existsSync(legacyManifestPath), `${pluginId}: legacy plugin.json must not exist on staged source`, errors);

  for (const materializedDir of ["agents", "skills", "assets", "references"]) {
    const fullPath = path.join(pluginDir, materializedDir);
    if (directoryHasEntries(fullPath)) {
      errors.push(`${pluginId}: ${materializedDir}/ must not exist on staged source`);
    }
  }

  if (!fs.existsSync(manifestPath)) {
    return;
  }

  const manifest = readJson(manifestPath);
  assert(typeof manifest.name === "string" && manifest.name.length > 0, `${pluginId}: name is required`, errors);
  assert(
    typeof manifest.description === "string" && manifest.description.length > 0,
    `${pluginId}: description is required`,
    errors
  );
  assert(typeof manifest.version === "string" && manifest.version.length > 0, `${pluginId}: version is required`, errors);

  for (const relPath of toArray(manifest.skills)) {
    assert(relPath.startsWith("./skills/"), `${pluginId}: invalid skill path ${relPath}`, errors);
    const skillId = relPath.replace(/^\.\/skills\//, "").replace(/\/$/, "");
    const skillPath = path.join(SKILLS_DIR, skillId, "SKILL.md");
    assert(fs.existsSync(skillPath), `${pluginId}: missing skill source ${skillPath}`, errors);
  }

  for (const relPath of toArray(manifest.agents)) {
    assert(relPath.startsWith("./agents/") && relPath.endsWith(".md"), `${pluginId}: invalid agent path ${relPath}`, errors);
    const agentId = path.basename(relPath, ".md");
    const agentPath = path.join(AGENTS_DIR, `${agentId}.agent.md`);
    assert(fs.existsSync(agentPath), `${pluginId}: missing agent source ${agentPath}`, errors);
  }
}

const errors = [];

for (const entry of fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    validatePluginDir(path.join(PLUGINS_DIR, entry.name), errors);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`Error: ${error}`);
  }
  process.exit(1);
}
