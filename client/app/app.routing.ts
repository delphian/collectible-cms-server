import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Route Components.
import { PasswordReset }                 from './components/password-reset/password-reset.component';
import { RoutesSiteHomeComponent }       from './routes/site/home/component';
import { RoutesAdminHomeComponent }      from './routes/admin/home/component';
import { RoutesUsersProfileComponent }   from './routes/users/profile/component';
import { RoutesUsersEditComponent }      from './routes/users/edit/component';
import { RoutesCollectibleView }         from './routes/collectible/view/view.component';

const appRoutes: Routes = [
    { path: '', component: RoutesSiteHomeComponent },
    { path: 'admin', component :RoutesAdminHomeComponent },
    { path: 'password-reset', component: PasswordReset },
    { path: 'u/:id', component: RoutesUsersProfileComponent },
    { path: 'u/:id/edit', component: RoutesUsersEditComponent },
    { path: 'c/:cId', component: RoutesCollectibleView },
    { path: 'u/:uId/:cId', component: RoutesCollectibleView }
];

export const appRoutingProviders: any[] = [
];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);