import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletViewComponent } from './wallet-view/wallet-view.component';

const routes: Routes = [
  // { path: 'store', component: StoreComponent, pathMatch: 'full' },
  // { path: 'home', component: HomeComponent, pathMatch: 'full' },
  // { path: 'account', component: AccountComponent, pathMatch: 'full' },
  // { path: 'edit', component: ProfileComponent, pathMatch: 'full' },
  // { path: 'store/:app', component: ItemCsomponent, pathMatch: 'full' },
  // { path: 'wallet/:id/:network', component: NetworkComponent, pathMatch: 'full' },
  { path: ':id', component: WalletViewComponent, pathMatch: 'full' },


  { path: '', redirectTo: '/P4Ws3cXfWPKPgRmQF6IK', pathMatch: 'full' },
  // { path: '/:any', redirectTo: '/home', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
