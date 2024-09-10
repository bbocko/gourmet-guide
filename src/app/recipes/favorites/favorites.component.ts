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
    const recipeIndex = this.recipeDetails().findIndex(
      (recipe) => recipe.id === id
    );

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
