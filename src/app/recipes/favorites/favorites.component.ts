import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoriteService } from './favorite.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RecipeCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent {
  private favoriteService = inject(FavoriteService);

  recipeDetails = computed(() => this.favoriteService.favRecipeDetailsArr());

  onIconClicked(id: number) {
    const recipeArr = this.recipeDetails();

    const recipeIndex = recipeArr.findIndex((recipe) => recipe.id === id);

    const recipe = recipeArr[recipeIndex];

    if (recipeIndex !== -1) {
      recipe.isFavorite = !recipe.isFavorite;

      if (!recipe.isFavorite) {
        // remove id from local storage
        this.favoriteService.removeFavorite(id);

        // get the current favorite recipe array
        const favRecipes = this.favoriteService.favRecipeDetailsArr();
        // filter out the recipe with the matching id
        const updatedFavRecipes = favRecipes.filter(
          (favRecipe) => favRecipe.id !== recipe.id
        );
        // set the updated array without the recipe
        this.favoriteService.favRecipeDetailsArr.set(updatedFavRecipes);
      }
    }
  }
}
