import { DatabaseService } from "./DatabaseService";
import {
  Recipe,
  CreateRecipeInput,
  CreateRecipeResult,
} from "../models/Recipe";

export class RecipeService {
  constructor(private db: DatabaseService) {}

  async getAllRecipes(): Promise<Recipe[]> {
    const query = `
      SELECT
        r.id,
        r.title,
        r.method,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'name', i.name,
              'supplier', i.supplier,
              'currentPrice', i.current_price
            )
          ) FILTER (WHERE i.id IS NOT NULL), '[]'
        ) AS ingredients,
        SUM(i.current_price) AS "totalCost"
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
      LEFT JOIN ingredients i ON i.id = ri.ingredient_id
      GROUP BY r.id
      ORDER BY r.id;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async getRecipeById(id: number): Promise<Recipe | null> {
    const query = `
      SELECT
        r.id,
        r.title,
        r.method,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'name', i.name,
              'supplier', i.supplier,
              'currentPrice', i.current_price
            )
          ) FILTER (WHERE i.id IS NOT NULL), '[]'
        ) AS ingredients,
        SUM(i.current_price) AS "totalCost"
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
      LEFT JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE r.id = $1
      GROUP BY r.id;
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async createRecipe(data: CreateRecipeInput): Promise<CreateRecipeResult> {
    const query = `
        SELECT * FROM create_recipe($1, $2, $3)
      `;
    const result = await this.db.query(query, [
      data.title,
      data.method,
      data.ingredientIds,
    ]);
    return {
      id: result.rows[0].recipe_id,
      title: result.rows[0].recipe_title,
    };
  }
}
