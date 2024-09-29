export interface Suggestion {
  id: number;
  title: string;
  imageType: string;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
}

export interface RecipeDetails {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  gaps: string;
  preparationMinutes: null;
  cookingMinutes: null;
  aggregateLikes: number;
  healthScore: number;
  creditsText: string;
  sourceName: string;
  pricePerServing: number;
  extendedIngredients: ExtendedIngredient[];
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
  imageType: string;
  summary: string;
  cuisines: any[];
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  winePairing: WinePairing;
  instructions: string;
  analyzedInstructions: AnalyzedInstruction[];
  originalId: null;
  spoonacularScore: number;
  spoonacularSourceUrl: string;
  isFavorite: boolean;
  nutritionData: NutritionData;
}

export interface NutritionData {
  calories: string;
  carbs: string;
  fat: string;
  protein: string;
  bad: Bad[];
  good: Good[];
  nutrients: Nutrient[];
  properties: Nutrient[];
  flavonoids: Nutrient[];
  ingredients: Ingredient[];
  caloricBreakdown: CaloricBreakdown;
  weightPerServing: WeightPerServing;
  expires: number;
  isStale: boolean;
}

export interface SimilarRecipes {
  id: number;
  imageType: string;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: Unit;
  percentOfDailyNeeds?: number;
}

export interface Bad {
  amount: string;
  indented: boolean;
  title: string;
  percentOfDailyNeeds: number;
}

export interface Good {
  amount: string;
  indented: boolean;
  title: string;
  percentOfDailyNeeds: number;
}

export interface CaloricBreakdown {
  percentFat: number;
  percentCarbs: number;
  percentProtein: number;
}

export enum Unit {
  Empty = '',
  G = 'g',
  Iu = 'IU',
  Kcal = 'kcal',
  Mg = 'mg',
  Unit = '%',
  Μg = 'µg',
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  id: number;
  nutrients: Nutrient[];
}

export interface WeightPerServing {
  amount: number;
  unit: Unit;
}

export interface AnalyzedInstruction {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
  ingredients: Ent[];
  equipment: Ent[];
  length?: Length;
}

export interface Ent {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface Length {
  number: number;
  unit: string;
}

export interface ExtendedIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: Consistency;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: Measures;
}

export enum Consistency {
  Liquid = 'LIQUID',
  Solid = 'SOLID',
}

export interface Measures {
  us: Metric;
  metric: Metric;
}

export interface Metric {
  amount: number;
  unitShort: string;
  unitLong: string;
}

export interface WinePairing {
  pairedWines: string[];
  pairingText: string;
  productMatches: ProductMatch[];
}

export interface ProductMatch {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  averageRating: number;
  ratingCount: number;
  score: number;
  link: string;
}
