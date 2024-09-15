import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FavoritesService } from './recipes/favorites/favorites.service';
import { SearchService } from './recipes/search/search.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private searchService = inject(SearchService);
  private favoritesService = inject(FavoritesService);

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    const favoriteIds = this.favoritesService.getFavorites(); // fetch favorite IDs from local storage

    if (favoriteIds.length === 0) {
      return; // break function if no favorites are stored in local storage
    }

    const idsString = favoriteIds.join(','); // convert the array of IDs to a comma-separated string

    this.searchService
      .getFavRecipeDetailsArr(idsString)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          console.log('Error fetching favorite recipe details:', error);
        },
      });
  }
}
