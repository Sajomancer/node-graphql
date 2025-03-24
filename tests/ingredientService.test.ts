import { DatabaseService } from "../backend/services/DatabaseService";
import { IngredientService } from "../backend/services/IngredientService";
import { Ingredient } from "../backend/models/Ingredient";

const mockDbService: Partial<DatabaseService> = {
  query: jest.fn(),
};

describe("IngredientService", () => {
  let ingredientService: IngredientService;
  // would be better to setup testcontainers with an actual postgres DB here
  beforeEach(() => {
    ingredientService = new IngredientService(mockDbService as DatabaseService);
  });

  it("getAllRecipes returns a list of recipes", async () => {
    const fakeIngredients: Ingredient[] = [
      {
        id: 1,
        currentPrice: 2.5,
        name: "test ingredient 1",
        supplier: "test supplier 1",
      },
      {
        id: 2,
        currentPrice: 3.5,
        name: "test ingredient 2",
        supplier: "test supplier 2",
      },
    ];
    (mockDbService.query as jest.Mock).mockResolvedValue({
      rows: fakeIngredients,
    });

    const ingredients = await ingredientService.getAllIngredients();

    expect(mockDbService.query).toHaveBeenCalled();
    expect(ingredients).toEqual(fakeIngredients);
  });

  it("getIngredientById returns a single ingredient", async () => {
    const fakeIngredient: Ingredient = {
      id: 1,
      currentPrice: 2.5,
      name: "test ingredient 1",
      supplier: "test supplier 1",
    };

    (mockDbService.query as jest.Mock).mockResolvedValue({
      rows: [fakeIngredient],
    });

    const ingredient = await ingredientService.getIngredientById(1);

    expect(mockDbService.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(ingredient).toEqual(fakeIngredient);
  });

  it("getIngredientById returns null for non-existent id", async () => {
    (mockDbService.query as jest.Mock).mockResolvedValue({
      rows: [],
    });

    const recipe = await ingredientService.getIngredientById(1);

    expect(mockDbService.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(recipe).toEqual(null);
  });
});
