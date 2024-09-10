import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { env } from '../../../../env.local';
import { Observable, tap } from 'rxjs';
import { RecipeDetails } from '../recipe.model';
import { FavoriteService } from '../favorites/favorite.service';

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

  private favoriteService = inject(FavoriteService);
  public recipeDetailsArr = signal<Partial<RecipeDetails>[]>([]);

  constructor(private http: HttpClient) {}

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
        this.recipeDetailsArr.set(
          response.map((recipe: Partial<RecipeDetails>) => {
            return {
              // store recipes array and add isFavorite property to each
              // recipe (value is based on if it's already stored as favorite)
              ...recipe,
              isFavorite: this.favoriteService.isFavorite(recipe.id!),
            };
          })
        );
      })
    );
  }

  getFavRecipeDetails(ids: string): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey).set('ids', ids);
    return this.http.get(this.informationBulkUrl, { params }).pipe(
      tap((response: any) => {
        this.favoriteService.favRecipeDetailsArr.set(
          response.map((recipe: Partial<RecipeDetails>) => {
            return {
              // store recipes array and mark recipes as favorite
              ...recipe,
              isFavorite: true,
            };
          })
        );
      })
    );
  }
}
