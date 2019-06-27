import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  { path: 'services', loadChildren: './components/pages/services/services.module#ServicesPageModule' },
  { path: 'help', loadChildren: './components/pages/help/help.module#HelpPageModule' },
  { path: 'payments', loadChildren: './components/pages/payments/payments.module#PaymentsPageModule' },
  { path: 'config', loadChildren: './components/pages/config/config.module#ConfigPageModule' },
  { path: 'profile', loadChildren: './components/pages/profile/profile.module#ProfilePageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
