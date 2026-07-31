import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const standaloneDirectory = join(".next", "standalone");

if (!existsSync(join(standaloneDirectory, "server.js"))) {
  throw new Error(
    "Standalone server was not generated. Ensure output is set to standalone.",
  );
}

const assets = [
  ["public", join(standaloneDirectory, "public")],
  [join(".next", "static"), join(standaloneDirectory, ".next", "static")],
];

for (const [source, destination] of assets) {
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

console.log("Copied public and static assets into the standalone build.");
