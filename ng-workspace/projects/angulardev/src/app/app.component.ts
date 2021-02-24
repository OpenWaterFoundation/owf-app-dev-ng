import { Component } from '@angular/core';

import { StateMod_TS } from '@owf/common/dwr/statemod';

import { OwfCommonService } from '@owf/common/services';

import { StringUtil } from '@owf/common/util/string';

import { WindowManager } from '@owf/common/ui/window-manager';

import { DialogDataTableComponent } from '@owf/common/ui/dialog';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angulardev';

  public windowManager: WindowManager = WindowManager.getInstance();

  constructor(private owfService: OwfCommonService) {

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    var TSObject = new StateMod_TS(this.owfService);
    TSObject.readTimeSeries('Larimer.DOLA.Population.Year', 'assets/Larimer.DOLA.Population.Year.filled.dv')
    .subscribe((resultsArray) => {
      console.log(resultsArray);
    });

    console.log(StringUtil.remove('doggy', 'g'));

    console.log(this.windowManager.windowExists('id'));
  }
}
