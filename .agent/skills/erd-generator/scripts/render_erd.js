import { spawnSync } from "child_process";

const input = process.argv[2];
const output = "docs/architecture/erd.svg";

const result = spawnSync("npx", ["mmdc", "-i", input, "-o", output], {
  encoding: "utf8",
});

if (result.status !== 0) {
  console.error("SYNTAX_ERROR:\n" + result.stderr);
  process.exit(1);
}

console.log("SUCCESS");
process.exit(0);