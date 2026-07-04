import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const url =
  process.env.GRAPHQL_BASE_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  "http://localhost:4000/graphql";

const schemaPath = path.join(process.cwd(), "schema.graphql");
const tmpPath = schemaPath + ".tmp";
const out = fs.createWriteStream(tmpPath);
const child = spawn("npx", ["get-graphql-schema", url]);

child.stdout.pipe(out);
child.stderr.pipe(process.stderr);

child.on("close", (code) => {
  if (code === 0) {
    fs.renameSync(tmpPath, schemaPath);
    console.log("Schema saved to schema.graphql");
  } else {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error(`Failed to fetch schema from ${url}`);
    process.exit(1);
  }
});
