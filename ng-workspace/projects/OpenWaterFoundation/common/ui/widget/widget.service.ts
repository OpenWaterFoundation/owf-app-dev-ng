import { Injectable }      from '@angular/core';

import { BehaviorSubject,
          Observable }     from 'rxjs';

import * as IM             from '@OpenWaterFoundation/common/services';


@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  /**
   * 
   */
  private selectedItem$: BehaviorSubject<IM.ChartSelectorComm> = new BehaviorSubject({noItemSelected: true});
  /**
   * 
   */
  private chartError$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /**
   * 
   */
  private selectorError$: BehaviorSubject<boolean> = new BehaviorSubject(false);


  constructor() {}


  /**
   * 
   * @returns 
   */
  getSelectedItem(): Observable<any> {
    return this.selectedItem$.asObservable();
  }

  /**
   * 
   * @param comm 
   */
  updateSelectedItem(comm: IM.ChartSelectorComm): void {
    this.selectedItem$.next(comm);
  }

  /**
   * 
   */
   get isChartError(): Observable<boolean> {
    return this.chartError$.asObservable();
  }

  /**
   * 
   */
  set setChartError(error: boolean) {
    this.chartError$.next(error);
  }
  
  /**
   * 
   */
  get isSelectorError(): Observable<boolean> {
    return this.selectorError$.asObservable();
  }

  /**
   * 
   */
  set setSelectorError(error: boolean) {
    this.selectorError$.next(error);
  }

}