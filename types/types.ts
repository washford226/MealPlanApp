export interface Meal {
    id: number; // Ensure this matches the type used in your backend (number or string)
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    userName: string;
    ingredients: string;
    averageRating: number;
  }
