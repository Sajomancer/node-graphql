import { createServer } from "../backend/createServer";

// These integration tests target the docker postgres instance, it would be better to either:
// 1) use testcontainers to spin up a postgres instance for the tests
// 2) define a separate test database and use it for the tests
// 3) use setup/teardown even with the docker instance

const testDbUrl = process.env.DATABASE_URL;
const { server, dbService } = createServer(testDbUrl);

afterAll(() => {
  dbService.close();
});

describe("GraphQL API", () => {
  describe("Ingredients", () => {
    it("fetches all ingredients", async () => {
      const res = await server.executeOperation({
        query: `
          query {
            ingredients {
              id
              name
              supplier
              currentPrice
            }
          }
        `,
      });

      expect(res.errors).toBeUndefined();
      expect(res.data).toHaveProperty("ingredients");
      expect(res.data!.ingredients[0]).toHaveProperty("id");
      expect(res.data!.ingredients[0]).toHaveProperty("name");
      expect(res.data!.ingredients[0]).toHaveProperty("supplier");
      expect(res.data!.ingredients[0]).toHaveProperty("currentPrice");
    });

    it("fetches one ingredient by id", async () => {
      const res = await server.executeOperation({
        query: `
          query {
            ingredient (id: 1) {
              id
              name
              supplier
              currentPrice
            }
          }
        `,
      });

      expect(res.errors).toBeUndefined();
      expect(res.data).toHaveProperty("ingredient");
      expect(res.data!.ingredient).toHaveProperty("id");
      expect(res.data!.ingredient).toHaveProperty("name");
      expect(res.data!.ingredient).toHaveProperty("supplier");
      expect(res.data!.ingredient).toHaveProperty("currentPrice");
    });

    it("returns null for non-existent ID", async () => {
      const res = await server.executeOperation({
        query: `
          query {
            ingredient (id: 2) {
              id
              name
              supplier
              currentPrice
            }
          }
        `,
      });

      expect(res.errors).toBeUndefined();
      expect(res.data).toEqual({ ingredient: null });
    });
  });

  describe("Recipes", () => {
    it("creates a recipe", async () => {
      const createRes = await server.executeOperation({
        query: `
          mutation CreateRecipe($data: CreateRecipeInput!) {
            createRecipe(data: $data) {
              id
              title
            }
          }
        `,
        variables: {
          data: {
            title: "New Recipe",
            method: "Mix ingredients and cook.",
            ingredientIds: [1, 3],
          },
        },
      });

      expect(createRes.errors).toBeUndefined();
      expect(createRes.data?.createRecipe.title).toEqual("New Recipe");
    });

    it("fetches all recipes", async () => {
      const res = await server.executeOperation({
        query: `
          query {
            recipes {
              id
              title
              method
              ingredients {
                id
                name
                supplier
                currentPrice
              }
              totalCost
            }
          }
        `,
      });

      expect(res.errors).toBeUndefined();
      expect(res.data).toHaveProperty("recipes");
    });

    it("fetches a recipe by ID", async () => {
      const res = await server.executeOperation({
        query: `
          query {
            recipe (id: 1) {
              id
              title
              method
              ingredients {
                id
                name
                supplier
                currentPrice
              }
              totalCost
            }
          }
        `,
      });

      expect(res.errors).toBeUndefined();
      expect(res.data).toHaveProperty("recipe");
      expect(res.data!.recipe).toHaveProperty("title");
      expect(res.data!.recipe).toHaveProperty("totalCost");
      expect(res.data!.recipe.totalCost).toEqual(43.72); // Known value in existing db ATM, but again, should have proper setup/teardown
    });
  });
});
