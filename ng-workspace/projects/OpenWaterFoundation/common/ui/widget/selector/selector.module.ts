import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule,
          ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule }    from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatMenuModule }      from '@angular/material/menu';
import { MatSelectModule }    from '@angular/material/select';
import { MatTooltipModule }   from '@angular/material/tooltip';

import { ScrollingModule }    from '@angular/cdk/scrolling';

import { SelectorComponent }  from './selector.component';

import { MatDatepickerModule }     from '@angular/material/datepicker';
import { MatDialogModule }         from '@angular/material/dialog';
import { MatExpansionModule }      from '@angular/material/expansion';
import { DateAdapter,
          ErrorStateMatcher,
          MatNativeDateModule, 
          MAT_DATE_FORMATS}        from '@angular/material/core';
import { MatSidenavModule }        from '@angular/material/sidenav';
import { MatSliderModule }         from '@angular/material/slider';
import { MatToolbarModule }        from '@angular/material/toolbar';


@NgModule({
  declarations: [
    SelectorComponent
  ],
  exports: [
    SelectorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    MatDatepickerModule,
MatDialogModule,
MatExpansionModule,
MatSidenavModule,
MatSliderModule,
MatToolbarModule,

    CommonModule,
    
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,

    ScrollingModule
  ]
})
export class SelectorModule { }
