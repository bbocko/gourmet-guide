import { Component, DestroyRef, inject, OnInit, output } from '@angular/core';
import { SearchService } from '../search/search.service';
import { FavoritesService } from '../favorites/favorites.service';
import { Nutrient, nutritionData, RecipeDetails } from '../recipe.model';
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
  recipe: Partial<RecipeDetails> | undefined;
  iconClicked = output<number>();

  sanitizedSummary: SafeHtml | undefined;
  sanitizedInstructions: SafeHtml | undefined;

  nutritionData: Partial<nutritionData> | undefined;
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
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.recipeId = id;

      // check if recipe is stored in-memory
      this.loadRecipe(id);

      if (!this.recipe) {
        // get recipe details from API
        this.fetchRecipeFromAPI(this.recipeId!);
      }
    } else {
      console.log('No valid recipe id found!');
    }
  }

  loadRecipe(id: string) {
    this.recipe =
      this.searchService.getRecipeById(id) ||
      this.favoritesService.getRecipeById(id);

    if (this.recipe) {
      // process the recipe summary
      this.processRecipeSummary();
      // process the recipe instuctions
      this.processRecipeInstructions();
      // get recipe nutrition
      this.getNutritionData(id);
    }
  }

  fetchRecipeFromAPI(id: string) {
    this.searchService
      .getRecipeDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resData) => {
          this.recipe = resData.length > 0 ? resData[0] : undefined;
          if (this.recipe) {
            // process the recipe summary
            this.processRecipeSummary();
            // process the recipe instuctions
            this.processRecipeInstructions();
            // get recipe nutrition
            this.getNutritionData(id);
          }
        },
        error: (error) => console.log('Error fetching recipe details:', error),
      });
  }

  // process and sanitize the recipe's summary
  processRecipeSummary() {
    if (this.recipe?.summary) {
      const cleanSummary = this.removeAnchorTags(this.recipe.summary);
      this.sanitizedSummary =
        this.sanitizer.bypassSecurityTrustHtml(cleanSummary);
    }
  }

  // process and sanitize the recipe's instructions
  processRecipeInstructions() {
    if (this.recipe?.instructions) {
      this.sanitizedInstructions = this.sanitizer.bypassSecurityTrustHtml(
        this.recipe.instructions
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
          this.nutritionData = resData;
          this.filterNutrients();
        },
        error: (error) =>
          console.log('Error fetching recipe nutrition:', error),
      });
  }

  filterNutrients() {
    if (this.nutritionData?.nutrients) {
      // filter nutrients based on the allowed nutrient names
      this.filteredNutrients = this.nutritionData.nutrients.filter((nutrient) =>
        this.allowedNutrients.includes(nutrient.name)
      );
    }
  }

  onIconClick() {
    this.iconClicked.emit(this.recipe!.id!);
  }

  onIconClicked(id: number) {
    console.log(id);
  }

  getTooltipMessage() {
    return this.recipe!.isFavorite
      ? 'Remove from favorites'
      : 'Add to favorites';
  }

  getStarColor() {
    return this.recipe!.isFavorite ? 'gold' : 'black';
  }
}
