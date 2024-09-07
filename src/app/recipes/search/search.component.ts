import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { RecipeService } from '../recipe.service';
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
  private destroyRef = inject(DestroyRef);
  private isOptionSelected = false;

  query = new FormControl<string>('');
  cuisine = new FormControl<string>('');
  diet = new FormControl<string>('');
  number = new FormControl<string>('5'); // get max 5 recipes at once

  suggestions: Suggestion[] = [];
  recipes: Recipe[] = [];
  recipeDetails: Partial<RecipeDetails>[] = [];

  constructor() {
    this.query.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => {
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
      number: this.number.value || '5',
    };

    if (queryParams.query) {
      const subscribtion = this.recipeService
        .searchRecipes(queryParams)
        .subscribe({
          next: (resData) => {
            this.recipes = resData.results;

            // store recipe IDs (for getRecipeDetails request)
            const recipeIds = this.recipes.map((recipe) => recipe.id).join(',');

            // get more details
            this.recipeService.getRecipeDetails(recipeIds).subscribe({
              next: (resData) => {
                this.recipeDetails = resData;
              },
            });

            this.suggestions = [];
          },
          error: (error) => {
            console.error('Error fetching recipes:', error);
            this.recipes = [];
          },
        });

      this.destroyRef.onDestroy(() => {
        subscribtion.unsubscribe();
      });
    }
  }

  onAutocomplete() {
    const queryValue = this.query.value;

    if (queryValue && queryValue.length > 1) {
      const subscribtion = this.recipeService
        .autocomplete(queryValue)
        .subscribe({
          next: (resData: Suggestion[]) => {
            this.suggestions = resData;
          },
        });

      this.destroyRef.onDestroy(() => {
        subscribtion.unsubscribe();
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
}
