import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';

import { FormsModule,
          ReactiveFormsModule }     from '@angular/forms';

import { MatButtonModule }          from '@angular/material/button';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatMenuModule }            from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule }          from '@angular/material/select';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { ScrollingModule }          from '@angular/cdk/scrolling';

import { SelectorComponent }        from './selector.component';
import { ErrorModule }              from '../error/error.module';


@NgModule({
  declarations: [
    SelectorComponent
  ],
  exports: [
    SelectorComponent
  ],
  imports: [
    CommonModule,
    
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,

    ScrollingModule,
    ErrorModule
  ]
})
export class SelectorModule { }
