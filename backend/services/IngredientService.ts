import { DatabaseService } from "./DatabaseService";
import { Ingredient } from "../models/Ingredient";

export class IngredientService {
  constructor(private db: DatabaseService) {}

  async getAllIngredients(): Promise<Ingredient[]> {
    const query =
      'SELECT id, name, supplier, current_price as "currentPrice" FROM ingredients';
    const result = await this.db.query(query);
    return result.rows;
    // pagination is missing
  }

  async getIngredientById(id: number): Promise<Ingredient | null> {
    const query = `
        SELECT id, name, supplier, current_price as "currentPrice" FROM ingredients WHERE id = $1
      `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }
}
