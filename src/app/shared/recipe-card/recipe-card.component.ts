import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RecipeDetails } from '../../recipes/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatTooltip,
    NgStyle,
  ],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  recipe = input.required<Partial<RecipeDetails>>();

  iconClicked = output<number>();

  onIconClick() {
    this.iconClicked.emit(this.recipe().id!);
  }

  getTooltipMessage() {
    return this.recipe().isFavorite
      ? 'Remove from favorites'
      : 'Add to favorites';
  }

  getStarColor() {
    return this.recipe().isFavorite ? 'gold' : 'black';
  }
}
