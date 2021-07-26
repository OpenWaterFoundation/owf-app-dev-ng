import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'lib-background-layer',
  templateUrl: './background-layer.component.html',
  styleUrls: ['./background-layer.component.css']
})
export class BackgroundLayerComponent implements AfterViewInit {
  // Information about the background layer provided in the configuration file.
  // Initialized in map.component.ts
  data: any;
  // The reference to the map component
  // Initialized in map.component.ts
  mapComponentReference: any;
  // Indicates whether or not the current background layer is selected
  checked: boolean = false;

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.      
  }

  selectBackgroundLayer() {
    
    this.mapComponentReference.selectBackgroundLayer(this.data.name);
  }

}
