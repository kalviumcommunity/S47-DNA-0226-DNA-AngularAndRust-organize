import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button';
import { CardComponent } from './card/card';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ButtonComponent,
    CardComponent
  ]
})
export class SharedModule { }
