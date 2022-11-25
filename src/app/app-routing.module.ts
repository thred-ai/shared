import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { StoreComponent } from './store/store.component';

const routes: Routes = [
  { path: 'store', component: StoreComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent, pathMatch: 'full' },
  { path: 'account', component: AccountComponent, pathMatch: 'full' },
  { path: 'auth', component: AuthComponent, pathMatch: 'full' },

  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  // { path: '/:any', redirectTo: '/home', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
