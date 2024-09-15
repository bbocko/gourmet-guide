import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from './favorites.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RecipeCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);

  recipeDetailsArr = computed(() =>
    this.favoritesService.favRecipeDetailsArr()
  );

  onIconClicked(id: number) {
    const recipeArr = this.recipeDetailsArr();

    const recipeIndex = recipeArr.findIndex((recipe) => recipe.id === id);

    const recipe = recipeArr[recipeIndex];

    if (recipeIndex !== -1) {
      recipe.isFavorite = !recipe.isFavorite;

      if (!recipe.isFavorite) {
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
  }
}
