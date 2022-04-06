import { Injectable }      from '@angular/core';

import { BehaviorSubject,
          Observable }     from 'rxjs';

import * as IM             from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  private testObs$: BehaviorSubject<string> = new BehaviorSubject('No basin selected.');


  constructor() {}

  
  public getTestObs(): Observable<string> {
    return this.testObs$.asObservable();
  }

  public setTestObs(data: string): void {
    this.testObs$.next(data);
  }
}