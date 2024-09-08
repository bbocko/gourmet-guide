import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoriteService } from './favorite.service';
import { RecipeService } from '../recipe.service';
import { RecipeDetails } from '../recipe.model';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RecipeCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private favoriteService = inject(FavoriteService);
  private destroyRef = inject(DestroyRef);

  recipeDetails: Partial<RecipeDetails>[] = [];

  ngOnInit() {
    this.loadFavoriteRecipes();
  }

  loadFavoriteRecipes() {
    const favoriteIds = this.favoriteService.getFavorites(); // fetch favorite IDs from local storage

    if (favoriteIds.length > 0) {
      const idsString = favoriteIds.join(','); // convert the array of IDs to a comma-separated string

      // fetch recipe details for the favorite IDs
      const subscription = this.recipeService
        .getRecipeDetails(idsString)
        .subscribe({
          next: (resData) => {
            this.recipeDetails = resData.map((recipe: any) => ({
              ...recipe,
              isFavorite: true, // set to true, since these are favorite recipes
            }));
          },
          error: (error) => {
            console.log('Error fetching recipe details:', error);
          },
        });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    } else {
      this.recipeDetails = [];
    }
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
