import { objectType, extendType, nonNull, intArg } from "nexus";

export const Ingredient = objectType({
  name: "Ingredient",
  definition(t) {
    t.int("id");
    t.string("name");
    t.string("supplier");
    t.float("currentPrice"); // no aliases?
  },
});

export const IngredientQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("ingredients", {
      type: "Ingredient",
      resolve: async (_parent, _args, ctx) => {
        return ctx.ingredientService.getAllIngredients();
      },
    });
    t.field("ingredient", {
      type: "Ingredient",
      args: { id: nonNull(intArg()) },
      resolve: (_parent, args, ctx) =>
        ctx.ingredientService.getIngredientById(args.id),
    });
  },
});
