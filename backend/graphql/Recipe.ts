import {
  arg,
  extendType,
  inputObjectType,
  intArg,
  nonNull,
  objectType,
} from "nexus";
import { Ingredient } from "./Ingredient";

export const Recipe = objectType({
  name: "Recipe",
  definition(t) {
    t.int("id");
    t.string("title");
    t.list.field("ingredients", { type: Ingredient });
    t.string("method");
    t.float("totalCost");
  },
});

export const CreateRecipeInput = inputObjectType({
  name: "CreateRecipeInput",
  definition(t) {
    t.string("title");
    t.string("method");
    t.list.field("ingredientIds", { type: "Int" });
  },
});

export const CreateRecipeResult = objectType({
  name: "CreateRecipeResult",
  definition(t) {
    t.int("id");
    t.string("title");
    // could return ingredients/method as well but I don't think it's necessary
  },
});

export const RecipeQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("recipes", {
      type: "Recipe",
      resolve: (_parent, _args, ctx) => ctx.recipeService.getAllRecipes(),
    });
    t.field("recipe", {
      type: "Recipe",
      args: { id: nonNull(intArg()) },
      resolve: (_parent, args, ctx) => ctx.recipeService.getRecipeById(args.id),
    });
  },
});

export const RecipeMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createRecipe", {
      type: "CreateRecipeResult",
      args: { data: nonNull(arg({ type: "CreateRecipeInput" })) },
      resolve: (_parent, args, ctx) =>
        ctx.recipeService.createRecipe(args.data),
    });
  },
});
