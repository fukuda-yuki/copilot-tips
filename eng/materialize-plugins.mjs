#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { AGENTS_DIR, PLUGINS_DIR, SKILLS_DIR } from "./constants.mjs";

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
  }
}

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

function resolveSkillSource(relPath) {
  const skillId = relPath.replace(/^\.\/skills\//, "").replace(/\/$/, "");
  return {
    dest: path.join("skills", skillId),
    src: path.join(SKILLS_DIR, skillId)
  };
}

function resolveAgentSource(relPath) {
  const agentId = path.basename(relPath, ".md");
  return {
    dest: path.join("agents", `${agentId}.md`),
    src: path.join(AGENTS_DIR, `${agentId}.agent.md`)
  };
}

function materializePlugin(pluginDir) {
  const manifestPath = path.join(pluginDir, ".github", "plugin", "plugin.json");
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  const manifest = readJson(manifestPath);

  fs.rmSync(path.join(pluginDir, "skills"), { force: true, recursive: true });
  fs.rmSync(path.join(pluginDir, "agents"), { force: true, recursive: true });
  fs.rmSync(path.join(pluginDir, "assets"), { force: true, recursive: true });
  fs.rmSync(path.join(pluginDir, "references"), { force: true, recursive: true });

  for (const relPath of toArray(manifest.skills)) {
    const resolved = resolveSkillSource(relPath);
    if (!fs.existsSync(resolved.src)) {
      throw new Error(`Skill source not found: ${resolved.src}`);
    }

    copyDirRecursive(resolved.src, path.join(pluginDir, resolved.dest));
  }

  for (const relPath of toArray(manifest.agents)) {
    const resolved = resolveAgentSource(relPath);
    if (!fs.existsSync(resolved.src)) {
      throw new Error(`Agent source not found: ${resolved.src}`);
    }

    const destPath = path.join(pluginDir, resolved.dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(resolved.src, destPath);
  }
}

for (const entry of fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    materializePlugin(path.join(PLUGINS_DIR, entry.name));
  }
}
