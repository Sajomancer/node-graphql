import { ApolloServer } from "apollo-server";
import { schema } from "./schema";
import { DatabaseService } from "./services/DatabaseService";
import { RecipeService } from "./services/RecipeService";
import { IngredientService } from "./services/IngredientService";

export function createServer(databaseUrl: string | undefined): {
  server: ApolloServer;
  dbService: DatabaseService;
} {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is mandatory.");
  }
  const dbService = new DatabaseService(databaseUrl);
  const recipeService = new RecipeService(dbService);
  const ingredientService = new IngredientService(dbService);

  const server = new ApolloServer({
    schema,
    context: () => ({ recipeService, ingredientService }),
  });

  return { server, dbService };
}
