import { makeSchema } from "nexus";
import path from "path";
import * as types from "./graphql";

export const schema = makeSchema({
  types: types,
  outputs: {
    schema: path.join(__dirname, "../generated/schema.graphql"),
    typegen: path.join(__dirname, "../generated/nexus-typegen.ts"),
  },
});
