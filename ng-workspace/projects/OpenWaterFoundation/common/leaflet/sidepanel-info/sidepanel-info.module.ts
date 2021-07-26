import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';

import { SidepanelInfoComponent } from '../sidepanel-info/sidepanel-info.component';
import { SidepanelInfoDirective } from '../sidepanel-info/sidepanel-info.directive';


@NgModule({
  declarations: [
    SidepanelInfoComponent,
    SidepanelInfoDirective
  ],
  imports: [
    CommonModule
  ]
})
export class SidepanelInfoModule { }
