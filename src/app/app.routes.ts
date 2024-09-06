import { Routes } from '@angular/router';
import { SearchComponent } from './recipes/search/search.component';
import { FavoritesComponent } from './recipes/favorites/favorites.component';
import { DetailsComponent } from './recipes/details/details.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
  },
  {
    path: 'details',
    component: DetailsComponent,
  },
];
