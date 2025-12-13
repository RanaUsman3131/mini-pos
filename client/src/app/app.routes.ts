import { Routes } from '@angular/router';
import { PosPageComponent } from './pos/pos-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  { path: 'pos', component: PosPageComponent },
  { path: '**', redirectTo: 'pos' },
];
