import { Component, computed, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { SearchService } from './search.service';
import { FavoriteService } from '../favorites/favorite.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Recipe, Suggestion } from '../recipe.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private searchService = inject(SearchService);
  private favoriteService = inject(FavoriteService);
  private destroyRef = inject(DestroyRef);
  private isOptionSelected = false;

  query = new FormControl<string>('');
  cuisine = new FormControl<string>('');
  diet = new FormControl<string>('');

  suggestions: Suggestion[] = [];
  recipes: Recipe[] = [];

  recipeDetails = computed(() => this.searchService.recipeDetailsArr());

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

    // don't call request if no query is set
    if (!this.query.value) {
      return;
    }

    // search for recipes that match query params
    this.searchService
      .searchRecipes(queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resData) => {
          this.recipes = resData.results;
          // store recipe IDs (for getRecipeDetails request)
          const recipeIds = this.recipes.map((recipe) => recipe.id).join(',');
          // get more details
          this.searchService.getRecipeDetails(recipeIds).subscribe({
            error: (error) => {
              console.log('Error fetching recipe details:', error);
              this.searchService.recipeDetailsArr.set([]);
            },
          });

          this.suggestions = [];
        },
        error: (error) => {
          console.log('Error fetching recipes:', error);
          this.recipes = [];
        },
      });
  }

  onAutocomplete() {
    const queryValue = this.query.value;

    if (queryValue && queryValue.length > 1) {
      this.searchService
        .autocomplete(queryValue)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resData: Suggestion[]) => {
            this.suggestions = resData;
          },
          error: (error) => {
            console.log('Error fetching suggestions:', error);
            this.suggestions = [];
          },
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
    const recipeIndex = this.searchService
      .recipeDetailsArr()
      .findIndex((recipe) => recipe.id === id);

    const recipe = this.recipeDetails();

    if (recipeIndex !== -1) {
      recipe[recipeIndex].isFavorite = !recipe[recipeIndex].isFavorite;

      if (recipe[recipeIndex].isFavorite) {
        this.favoriteService.addFavorite(id);
      } else {
        this.favoriteService.removeFavorite(id);
      }
    }
  }
}
