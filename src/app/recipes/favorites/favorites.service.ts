import { Injectable, signal } from '@angular/core';
import { RecipeDetails } from '../recipe.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favorites';

  public favRecipeDetailsArr = signal<Partial<RecipeDetails>[]>([]);

  private favoritesLoadedSubject = new BehaviorSubject<boolean>(false);
  favoritesLoaded$ = this.favoritesLoadedSubject.asObservable();

  getRecipeById(id: string) {
    const numericId = +id;
    return this.favRecipeDetailsArr().find((recipe) => recipe.id === numericId);
  }

  getFavorites(): number[] {
    const favorites = localStorage.getItem(this.FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  }

  loadFavorites(favorites: Partial<RecipeDetails>[]) {
    this.favRecipeDetailsArr.set(favorites);
    this.favoritesLoadedSubject.next(true); // notify that favorites are loaded
  }

  addFavorite(id: number): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  removeFavorite(id: number): void {
    let favorites = this.getFavorites();
    favorites = favorites.filter((favId) => favId !== id);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().includes(id);
  }
}
