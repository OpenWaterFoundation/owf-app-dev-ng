import { Component,
          Inject }          from '@angular/core';
import { DOCUMENT }         from '@angular/common';

import { map }              from 'rxjs/operators';

import { DataUnits }        from '@OpenWaterFoundation/common/util/io';
import { OwfCommonService,
          Path } from '@OpenWaterFoundation/common/services';
import { WindowManager }    from '@OpenWaterFoundation/common/ui/window-manager';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angulardev';

  windowManager: WindowManager = WindowManager.getInstance();


  /**
   * Constructor for the Angular Dev App Component. The version number below is
   * used by the `create-common-package.sh` file to determine the app version.
   * Version: 3.0.0
   * @param owfService 
   * @param document 
   */
  constructor(private owfService: OwfCommonService,
              @Inject(DOCUMENT) private document: Document) { }


  /**
   * 
   */
  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first
    // call to ngOnChanges. Set the app's favicon.
    this.document.getElementById('appFavicon').setAttribute('href', 'assets/app/img/OWF-Logo-Favicon-32x32.ico');
  }

  /**
   * Asynchronously reads the data unit file to determine what the precision is for units when displaying them in a dialog table.
   * @param dataUnitsPath The path to the dataUnits file.
   */
  private setDataUnits(dataUnitsPath: string): void {
    this.owfService.getPlainText(this.owfService.buildPath(Path.dUP, [dataUnitsPath]), Path.dUP).pipe(map((dfile: any) => {
      let dfileArray = dfile.split('\n');
      // Convert the returned string above into an array of strings as an argument
      DataUnits.readUnitsFileBool ( dfileArray, true );

      return DataUnits.getUnitsData();
    })).subscribe((results: DataUnits[]) => {
      this.owfService.setDataUnitsArr(results);
    });
  }
}
