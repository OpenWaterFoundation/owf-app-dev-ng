import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[side-panel-info-host]'
})
export class SidepanelInfoDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
