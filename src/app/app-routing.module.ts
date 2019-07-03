import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/GUARDS/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule',
    canActivate: [AuthGuard]
  },
  { path: 'services', loadChildren: './components/pages/services/services.module#ServicesPageModule', canActivate: [AuthGuard] },
  { path: 'help', loadChildren: './components/pages/help/help.module#HelpPageModule', canActivate: [AuthGuard] },
  { path: 'payments', loadChildren: './components/pages/payments/payments.module#PaymentsPageModule', canActivate: [AuthGuard] },
  { path: 'config', loadChildren: './components/pages/config/config.module#ConfigPageModule', canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: './components/pages/profile/profile.module#ProfilePageModule', canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: './components/pages/public/public.module#PublicModule'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
