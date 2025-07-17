import { writeFile } from "fs/promises";
import fetchSchema from "fetch-graphql-schema";
import { formatSdl } from "format-graphql";

async function main() {
  // TODO this utility script is REALLY old - audit/ replace it?
  let schema = await fetchSchema("http://localhost:8080/graphql", {
    readable: true,
  });

  const incorrectGqlSyntax = /(implements\s+)([^{]+)(\{)/g;
  schema = schema.replace(incorrectGqlSyntax, (a, prefix, list, brace) => {
    const newList = list.split(",").join(" &");
    return prefix + newList + brace;
  });

  const schemaFormatted = formatSdl(schema);
  await writeFile("src/schema.graphql", schemaFormatted);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
