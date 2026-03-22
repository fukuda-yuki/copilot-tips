import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT_FOLDER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const AGENTS_DIR = path.join(ROOT_FOLDER, "agents");
export const SKILLS_DIR = path.join(ROOT_FOLDER, "skills");
export const PLUGINS_DIR = path.join(ROOT_FOLDER, "plugins");
export const MARKETPLACE_FILE = path.join(ROOT_FOLDER, ".github", "plugin", "marketplace.json");
