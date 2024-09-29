import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { env } from '../../../../env.local';
import { Observable, tap } from 'rxjs';
import { RecipeDetails } from '../recipe.model';
import { FavoritesService } from '../favorites/favorites.service';

interface QueryParams {
  query: string;
  cuisine: string;
  diet: string;
  number: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiKey = env.apiKey;
  private complexSearchUrl =
    'https://api.spoonacular.com/recipes/complexSearch';
  private autocompleteUrl = 'https://api.spoonacular.com/recipes/autocomplete';
  private informationBulkUrl =
    'https://api.spoonacular.com/recipes/informationBulk';

  private favoritesService = inject(FavoritesService);
  public recipeDetailsArr = signal<Partial<RecipeDetails>[]>([]);

  constructor(private http: HttpClient) {}

  getRecipeById(id: string) {
    const numericId = +id;
    return this.recipeDetailsArr().find((recipe) => recipe.id === numericId);
  }

  searchRecipes(queryParams: QueryParams): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey);
    for (let key in queryParams) {
      if (queryParams[key as keyof QueryParams]) {
        params = params.set(key, queryParams[key as keyof QueryParams]);
      }
    }
    return this.http.get(this.complexSearchUrl, { params });
  }

  autocomplete(query: string): Observable<any> {
    let params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('query', query)
      .set('number', '5');
    return this.http.get(this.autocompleteUrl, { params });
  }

  getRecipeDetails(ids: string): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey).set('ids', ids);
    return this.http.get(this.informationBulkUrl, { params }).pipe(
      tap((response: any) => {
        response.map((recipe: Partial<RecipeDetails>) => {
          return {
            // add isFavorite property to recipe
            ...recipe,
            isFavorite: this.favoritesService.isFavorite(recipe.id!),
          };
        });
      })
    );
  }

  getSimilarRecipes(id: string): Observable<any> {
    let similarUrl = `https://api.spoonacular.com/recipes/${id}/similar`;
    let params = new HttpParams().set('apiKey', this.apiKey).set('number', '3');
    return this.http.get(similarUrl, { params });
  }

  getSimilarRecipeDetailsArr(ids: string): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey).set('ids', ids);
    return this.http.get(this.informationBulkUrl, { params }).pipe(
      tap((response: any) => {
        response.map((recipe: Partial<RecipeDetails>) => {
          return {
            // return recipes array and add isFavorite property to each (value is based on if it's already stored as favorite)
            ...recipe,
            isFavorite: this.favoritesService.isFavorite(recipe.id!),
          };
        });
      })
    );
  }

  getRecipeDetailsArr(ids: string): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey).set('ids', ids);
    return this.http.get(this.informationBulkUrl, { params }).pipe(
      tap((response: any) => {
        this.recipeDetailsArr.set(
          response.map((recipe: Partial<RecipeDetails>) => {
            return {
              // store recipes array and add isFavorite property to each (value is based on if it's already stored as favorite)
              ...recipe,
              isFavorite: this.favoritesService.isFavorite(recipe.id!),
            };
          })
        );
      })
    );
  }

  getFavRecipeDetailsArr(ids: string): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey).set('ids', ids);

    return this.http.get(this.informationBulkUrl, { params }).pipe(
      tap((response: any) => {
        const favoriteRecipes = response.map(
          (recipe: Partial<RecipeDetails>) => {
            return {
              // mark recipes as favorite
              ...recipe,
              isFavorite: true,
            };
          }
        );
        // store the recipes in the local array
        this.favoritesService.favRecipeDetailsArr.set(favoriteRecipes);
        // notify the FavoritesService that the loading is complete
        this.favoritesService.loadFavorites(favoriteRecipes);
      })
    );
  }

  getRecipeNutrition(id: string): Observable<any> {
    let nutritionUrl = `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json`;
    let params = new HttpParams().set('apiKey', this.apiKey);
    return this.http.get(nutritionUrl, { params });
  }
}
