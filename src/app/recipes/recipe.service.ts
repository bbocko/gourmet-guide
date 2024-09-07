import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env.local';
import { Observable } from 'rxjs';

interface QueryParams {
  query: string;
  cuisine: string;
  diet: string;
  number: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private apiKey = env.apiKey;
  private complexSearchUrl =
    'https://api.spoonacular.com/recipes/complexSearch';
  private autocompleteUrl = 'https://api.spoonacular.com/recipes/autocomplete';
  private informationBulkUrl =
    'https://api.spoonacular.com/recipes/informationBulk';

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
    return this.http.get(this.informationBulkUrl, { params });
  }
}
