import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { RecipeService } from '../recipe.service';
import { FavoriteService } from '../favorites/favorite.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Recipe, RecipeDetails, Suggestion } from '../recipe.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    RecipeCardComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  private recipeService = inject(RecipeService);
  private favoriteService = inject(FavoriteService);
  private destroyRef = inject(DestroyRef);
  private isOptionSelected = false;

  query = new FormControl<string>('');
  cuisine = new FormControl<string>('');
  diet = new FormControl<string>('');

  suggestions: Suggestion[] = [];
  recipes: Recipe[] = [];
  recipeDetails: Partial<RecipeDetails>[] = [];

  constructor() {
    this.query.valueChanges
      // optimize triggering onAutocomplete function
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => {
        // check if query value changes from selection autocomplete suggestion
        if (!this.isOptionSelected) {
          this.onAutocomplete();
        }
        this.isOptionSelected = false;
      });
  }

  onSearch() {
    const queryParams = {
      query: this.query.value || '',
      cuisine: this.cuisine.value || '',
      diet: this.diet.value || '',
      number: '6', // get max 6 recipes at once
    };

    if (queryParams.query) {
      // search for recipes that match query params
      const subscription = this.recipeService
        .searchRecipes(queryParams)
        .subscribe({
          next: (resData) => {
            this.recipes = resData.results;
            // store recipe IDs (for getRecipeDetails request)
            const recipeIds = this.recipes.map((recipe) => recipe.id).join(',');
            // get more details
            this.recipeService.getRecipeDetails(recipeIds).subscribe({
              next: (resData) => {
                this.recipeDetails = resData.map(
                  (recipe: Partial<RecipeDetails>) => {
                    return {
                      // store recipes array and add isFavorite property to each
                      // recipe (value is based on if it's already stored as favorite)
                      ...recipe,
                      isFavorite: this.favoriteService.isFavorite(recipe.id!),
                    };
                  }
                );
              },
              error: (error) => {
                console.log('Error fetching recipe details:', error);
                this.recipeDetails = [];
              },
            });

            this.suggestions = [];
          },
          error: (error) => {
            console.log('Error fetching recipes:', error);
            this.recipes = [];
          },
        });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    }
  }

  onAutocomplete() {
    const queryValue = this.query.value;

    if (queryValue && queryValue.length > 1) {
      const subscription = this.recipeService
        .autocomplete(queryValue)
        .subscribe({
          next: (resData: Suggestion[]) => {
            this.suggestions = resData;
          },
          error: (error) => {
            console.log('Error fetching suggestions:', error);
            this.suggestions = [];
          },
        });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    } else {
      this.suggestions = [];
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedValue = event.option.value;
    this.query.setValue(selectedValue);
    this.isOptionSelected = true;
    this.suggestions = [];
  }

  onIconClicked(id: number) {
    const recipeIndex = this.recipeDetails.findIndex(
      (recipe) => recipe.id === id
    );

    if (recipeIndex !== -1) {
      this.recipeDetails[recipeIndex].isFavorite =
        !this.recipeDetails[recipeIndex].isFavorite;

      if (this.recipeDetails[recipeIndex].isFavorite) {
        this.favoriteService.addFavorite(id);
      } else {
        this.favoriteService.removeFavorite(id);
      }
    }
  }
}
