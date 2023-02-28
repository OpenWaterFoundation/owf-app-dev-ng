import { NgModule }           from '@angular/core';
import { RouterModule,
          Routes}             from '@angular/router';
          
import { MapComponent }       from '@OpenWaterFoundation/common/leaflet';
import { DashboardComponent } from '@OpenWaterFoundation/common/ui/dashboard';
import { HomeComponent }      from './home/home.component';
import { NotFoundComponent }  from './not-found/not-found.component';
import { OwfCommonComponent } from './owf-common/owf-common.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'owf-common', component: OwfCommonComponent },
  { path: 'home', component: HomeComponent },
  { path: 'map/:id', component: MapComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    onSameUrlNavigation: "reload",
    initialNavigation: 'enabledBlocking',
    relativeLinkResolution: 'legacy'
})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
