import { RecipeService } from "../backend/services/RecipeService";
import { DatabaseService } from "../backend/services/DatabaseService";
import { Recipe } from "../backend/models/Recipe";

const mockDbService: Partial<DatabaseService> = {
  query: jest.fn(),
};

describe("RecipeService", () => {
  let recipeService: RecipeService;
  // would be better to setup testcontainers with an actual postgres DB here
  beforeEach(() => {
    recipeService = new RecipeService(mockDbService as DatabaseService);
  });

  it("getAllRecipes returns a list of recipes", async () => {
    const fakeRecipes: Recipe[] = [
      {
        id: 1,
        title: "Test Recipe",
        method: "Test method",
        ingredients: [
          {
            id: 1,
            currentPrice: 2.5,
            name: "test ingredient",
            supplier: "test supplier",
          },
        ],
        totalCost: 2.5,
      },
    ];
    (mockDbService.query as jest.Mock).mockResolvedValue({ rows: fakeRecipes });

    const recipes = await recipeService.getAllRecipes();

    expect(mockDbService.query).toHaveBeenCalled();
    expect(recipes).toEqual(fakeRecipes);
  });

  it("getRecipeById returns a single recipe", async () => {
    const fakeRecipe: Recipe = {
      id: 1,
      title: "Test Recipe",
      method: "Test method",
      ingredients: [
        {
          id: 1,
          currentPrice: 2.5,
          name: "test ingredient",
          supplier: "test supplier",
        },
      ],
      totalCost: 2.5,
    };
    (mockDbService.query as jest.Mock).mockResolvedValue({
      rows: [fakeRecipe],
    });

    const recipe = await recipeService.getRecipeById(1);

    expect(mockDbService.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(recipe).toEqual(fakeRecipe);
  });

  it("getIngredientById returns null for non-existent id", async () => {
    (mockDbService.query as jest.Mock).mockResolvedValue({
      rows: [],
    });

    const recipe = await recipeService.getRecipeById(1);

    expect(mockDbService.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(recipe).toEqual(null);
  });
});
