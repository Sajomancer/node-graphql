import { Ingredient } from "./Ingredient";

export interface Recipe {
  id: number;
  title: string;
  method: string;
  ingredients: Ingredient[];
  totalCost: number;
}

export interface CreateRecipeInput {
  title: string;
  method: string;
  ingredientIds: number[];
}

export interface CreateRecipeResult {
  id: number;
  title: string;
}
