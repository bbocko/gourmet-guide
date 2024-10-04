import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SearchService } from '../search/search.service';
import { FavoritesService } from '../favorites/favorites.service';
import {
  Nutrient,
  NutritionData,
  RecipeDetails,
  SimilarRecipes,
} from '../recipe.model';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle } from '@angular/common';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltip,
    NgStyle,
    RecipeCardComponent,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private searchService = inject(SearchService);
  private favoritesService = inject(FavoritesService);

  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  recipeId: string | undefined;
  recipe = signal<Partial<RecipeDetails> | undefined>(undefined);
  similarRecipesArr = signal<Partial<SimilarRecipes[]> | undefined>(undefined);
  similarRecipesDetailsArr = signal<Partial<RecipeDetails[]> | undefined>(
    undefined
  );

  sanitizedSummary: SafeHtml | undefined;
  sanitizedInstructions: SafeHtml | undefined;

  nutritionData: Partial<NutritionData> | undefined;
  allowedNutrients = [
    'Calories',
    'Carbohydrates',
    'Sugar',
    'Protein',
    'Fat',
    'Saturated Fat',
  ];
  filteredNutrients: Nutrient[] = [];

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.recipeId = id;

          // reset component state
          this.resetRecipeState();

          // load recipe and similar recipes based on ID
          this.loadRecipeData(id);
        } else {
          console.log('No valid recipe id found!');
        }
      });
  }

  loadRecipeData(id: string) {
    // wait for favorites to be loaded before checking if the recipe is stored in-memory
    this.favoritesService.favoritesLoaded$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((favoritesLoaded) => {
        if (favoritesLoaded) {
          this.loadRecipe(id);

          if (!this.recipe()) {
            this.fetchRecipeFromAPI(id);
          }
        }
      });

    this.searchService
      .getSimilarRecipes(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resData) => {
          this.similarRecipesArr.set(resData);

          const recipeIds = this.similarRecipesArr()!
            .map((recipe) => recipe!.id)
            .join(',');

          this.searchService.getSimilarRecipeDetailsArr(recipeIds).subscribe({
            next: (resData) => {
              this.similarRecipesDetailsArr.set(resData);
            },
            error: (error) => {
              console.log('Error fetching similar recipe details:', error);
              this.similarRecipesDetailsArr.set(undefined);
            },
          });
        },
        error: (error) => {
          console.log('Error fetching similar recipes:', error);
          this.similarRecipesArr.set(undefined);
        },
      });
  }

  loadRecipe(id: string) {
    const recipe =
      this.searchService.getRecipeById(id) ||
      this.favoritesService.getRecipeById(id);

    if (recipe) {
      // process the recipe summary
      this.processRecipeSummary(recipe);
      // process the recipe instuctions
      this.processRecipeInstructions(recipe);
      // get recipe nutrition
      this.getNutritionData(id);

      this.recipe.set(recipe);
    }
  }

  fetchRecipeFromAPI(id: string) {
    this.searchService
      .getRecipeDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resData) => {
          const recipe = resData.length > 0 ? resData[0] : undefined;
          if (recipe) {
            // process the recipe summary
            this.processRecipeSummary(recipe);
            // process the recipe instuctions
            this.processRecipeInstructions(recipe);
            // get recipe nutrition
            this.getNutritionData(id);
          }

          this.recipe.set(recipe);
        },
        error: (error) => console.log('Error fetching recipe details:', error),
      });
  }

  // method to reset component state when the route parameter changes
  resetRecipeState() {
    this.recipe.set(undefined);
    this.sanitizedSummary = undefined;
    this.sanitizedInstructions = undefined;
    this.filteredNutrients = [];
    this.similarRecipesArr.set(undefined);
    this.similarRecipesDetailsArr.set(undefined);
  }

  // process and sanitize the recipe's summary
  processRecipeSummary(recipe: Partial<RecipeDetails>) {
    if (recipe.summary) {
      const cleanSummary = this.removeAnchorTags(recipe.summary);
      this.sanitizedSummary =
        this.sanitizer.bypassSecurityTrustHtml(cleanSummary);
    }
  }

  // process and sanitize the recipe's instructions
  processRecipeInstructions(recipe: Partial<RecipeDetails>) {
    if (recipe.instructions) {
      this.sanitizedInstructions = this.sanitizer.bypassSecurityTrustHtml(
        recipe.instructions
      );
    }
  }

  // remove anchor tags and clean up the HTML
  removeAnchorTags(summary: string): string {
    // find the index of the first anchor tag
    let firstAnchorIndex = summary.indexOf('<a ');

    let summaryText = summary;

    if (firstAnchorIndex !== -1) {
      // find the last period before the first anchor tag
      let lastPeriodIndex = summary.lastIndexOf('.', firstAnchorIndex);
      // slice the text up to and including the last period
      summaryText = summary.slice(0, lastPeriodIndex + 1);
    }
    // remove any remaining anchor tags and other HTML tags except <b>
    return summaryText
      .replace(/<a[^>]*>(.*?)<\/a>/g, '')
      .replace(/<[^b\/][^>]*>/g, '');
  }

  getNutritionData(id: string) {
    this.searchService
      .getRecipeNutrition(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resData) => {
          this.recipe()!.nutritionData = resData;
          this.filterNutrients();
        },
        error: (error) =>
          console.log('Error fetching recipe nutrition:', error),
      });
  }

  filterNutrients() {
    const nutritionData = this.recipe()!.nutritionData;
    if (nutritionData?.nutrients) {
      // filter nutrients based on the allowed nutrient names
      this.filteredNutrients = nutritionData.nutrients.filter((nutrient) =>
        this.allowedNutrients.includes(nutrient.name)
      );
    }
  }

  onIconClicked(id: number) {
    const recipe = this.recipe()!;

    recipe.isFavorite = !recipe.isFavorite;

    if (recipe.isFavorite) {
      // add id to local storage
      this.favoritesService.addFavorite(id);

      // get the current favorite recipe array
      const favRecipes = this.favoritesService.favRecipeDetailsArr();
      // check if the recipe already exists in the favorites array
      const alreadyFavorite = favRecipes.some(
        (favRecipe) => favRecipe.id === recipe.id
      );

      if (!alreadyFavorite) {
        // if recipe isn't favorite, add it to the array
        favRecipes.push(recipe);
        // set the updated array back
        this.favoritesService.favRecipeDetailsArr.set(favRecipes);
      }
    } else {
      // remove id from local storage
      this.favoritesService.removeFavorite(id);

      // get the current favorite recipe array
      const favRecipes = this.favoritesService.favRecipeDetailsArr();
      // filter out the recipe with the matching id
      const updatedFavRecipes = favRecipes.filter(
        (favRecipe) => favRecipe.id !== recipe.id
      );
      // set the updated array without the recipe
      this.favoritesService.favRecipeDetailsArr.set(updatedFavRecipes);
    }
  }

  onCardIconClicked(id: number) {
    const recipe = this.similarRecipesDetailsArr()!.find(
      (recipe) => recipe!.id === id
    );

    recipe!.isFavorite = !recipe!.isFavorite;

    if (recipe!.isFavorite) {
      // add id to local storage
      this.favoritesService.addFavorite(id);

      // get the current favorite recipe array
      const favRecipes = this.favoritesService.favRecipeDetailsArr();
      // check if the recipe already exists in the favorites array
      const alreadyFavorite = favRecipes.some(
        (favRecipe) => favRecipe.id === recipe!.id
      );

      if (!alreadyFavorite) {
        // if recipe isn't favorite, add it to the array
        favRecipes.push(recipe!);
        // set the updated array back
        this.favoritesService.favRecipeDetailsArr.set(favRecipes);
      }
    } else {
      // remove id from local storage
      this.favoritesService.removeFavorite(id);

      // get the current favorite recipe array
      const favRecipes = this.favoritesService.favRecipeDetailsArr();
      // filter out the recipe with the matching id
      const updatedFavRecipes = favRecipes.filter(
        (favRecipe) => favRecipe.id !== recipe!.id
      );
      // set the updated array without the recipe
      this.favoritesService.favRecipeDetailsArr.set(updatedFavRecipes);
    }
  }

  getTooltipMessage(recipe: Partial<RecipeDetails>) {
    return recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites';
  }

  getStarColor(recipe: Partial<RecipeDetails>) {
    return recipe.isFavorite ? 'gold' : 'black';
  }
}
