import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FavoritesService } from './recipes/favorites/favorites.service';
import { SearchService } from './recipes/search/search.service';

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

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    const favoriteIds = this.favoritesService.getFavorites(); // fetch favorite IDs from local storage

    if (favoriteIds.length === 0) {
      this.favoritesService.loadFavorites([]); // notify that no favorites are present
      return; // exit function if no favorites are stored in local storage
    }

    const idsString = favoriteIds.join(','); // convert the array of IDs to a comma-separated string

    // trigger the loading in the SearchService and FavoritesService
    this.searchService.getFavRecipeDetailsArr(idsString).subscribe({
      error: (error) => {
        console.log('Error fetching favorite recipe details:', error);
      },
    });
  }
}
