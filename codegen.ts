import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  documents: "common/graphql/**/*.graphql",
  ignoreNoDocuments: true,
  generates: {
    "common/graphql/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
        useConstEnums: true,
      },
      config: {
        scalars: {
          DateTime: "string",
          JSON: "Record<string, unknown>",
        },
      },
    },
    "common/graphql.d.ts": {
      plugins: ["typescript-graphql-files-modules"],
    },
  },
};

export default config;
