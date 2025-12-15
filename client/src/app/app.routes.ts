import { Routes } from '@angular/router';
import { PosPageComponent } from './pos/pos-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', component: PosPageComponent },
  { path: '**', redirectTo: '' },
];
