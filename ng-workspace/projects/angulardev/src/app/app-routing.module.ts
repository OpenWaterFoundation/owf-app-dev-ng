import { NgModule }           from '@angular/core';
import { RouterModule,
          Routes}             from '@angular/router';
          
import { MapComponent }       from '@OpenWaterFoundation/common/leaflet';
import { HomeComponent }      from './home/home.component';
import { NotFoundComponent }  from './not-found/not-found.component';
import { OwfCommonComponent } from './owf-common/owf-common.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'owf-common', component: OwfCommonComponent },
  { path: 'home', component: HomeComponent },
  { path: 'map/:id', component: MapComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
  // { path: 'content-page/:markdownFilename', component: ContentPageComponent },
  // { path: 'map-error', component: MapErrorComponent },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    onSameUrlNavigation: "reload",
    initialNavigation: 'enabled',
    relativeLinkResolution: 'legacy'
})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
