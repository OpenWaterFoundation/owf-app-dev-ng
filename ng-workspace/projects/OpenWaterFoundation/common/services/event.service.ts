import { Injectable }          from '@angular/core';

import { BehaviorSubject,
          Observable,
          of }                 from 'rxjs';
import { DashboardConf,
          DashboardWidget,
          ListenedToWidget,
          Widget,
          WidgetEvent,
          WidgetEventHandler } from './types';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  /** The currently supported widget types that can listen to the Select widget. */
  private readonly SUPPORTEDSELECTEVENTWIDGETS = [
    Widget.cht,
    Widget.ind
  ];
  /** Array of ListenedToWidget objects, which contain the name of the widget that
   * is being listened to, and the BehaviorSubject attached to the widget. */
  private listenedToWidgets: ListenedToWidget[] = [];


  /**
   * Constructor for the EventService.
   */
  constructor() { }


  /**
   * Getter for all supported widgets that can listen to a SelectEvent.
   */
  get supportedSelectEventWidgets(): string[] { return this.SUPPORTEDSELECTEVENTWIDGETS }

  /**
   * Determines if a widget supports the SelectEvent type.
   */
  private canSelect(widget: DashboardWidget): boolean {
    for (let supportedWidgetType of this.SUPPORTEDSELECTEVENTWIDGETS) {
      if (supportedWidgetType.toLowerCase() === widget.type.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds ListenedToWidget objects into the listenedToWidgets array based on the
   * provided eventHandlers property in the dashboard configuration file.
   * @param dashboardConfig The dashboard configuration object.
   */
  createListenedToWidgets(dashboardConfig: DashboardConf): void {

    var listenedToWidgetNames: string[] = [];

    dashboardConfig.widgets.forEach((widget: DashboardWidget) => {
      
      if (widget.eventHandlers) {
        widget.eventHandlers.forEach((eventHandler: WidgetEventHandler) => {

          // Check if the widget has already been added to the listenedToWidgets
          // array.
          if (listenedToWidgetNames.includes(eventHandler.widgetName)) {
            return;
          }
          listenedToWidgetNames.push(eventHandler.widgetName);

          this.listenedToWidgets.push({
            name: eventHandler.widgetName,
            behaviorSubject: new BehaviorSubject(null)
          });
        });
      } else return;
    });

  }

  /**
   * Determines whether the widget calling this method is allowed to listen to an
   * event, and returns the correct observable from the dynamically made listenedToWidgets
   * array.
   * @returns An Observable of a WidgetEvent if all checks were passed, or null. 
   */
  getWidgetEvent(widget: DashboardWidget): Observable<WidgetEvent> {

    if (widget.eventHandlers && this.isSupportedWidgetEvent(widget) === true) {

      for (let listenedToWidget of this.listenedToWidgets) {
        for (let eventHandler of widget.eventHandlers) {
          if (eventHandler.widgetName.toLowerCase() === listenedToWidget.name.toLowerCase()) {
            return listenedToWidget.behaviorSubject.asObservable();
          }
        }
      }
    }
    return of(null);
  }

  /**
   * Determines whether a widget's eventHandler object wants to listen to a SelectEvent.
   * @param widget The widget object whose eventHandlers are checked.
   * @returns True if the widget eventHandler object's eventType is SelectEvent,
   * and false otherwise.
   */
  hasSelectEvent(widget: DashboardWidget): boolean {

    if (!widget.eventHandlers) {
      return false;
    }
    
    for (let widgetEvent of widget.eventHandlers) {
      if (widgetEvent.eventType.toLowerCase() === 'selectevent') {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks to see if the widget that wants to listen to a specific event is supported.
   * @param widget The widget object.
   * @returns A boolean whether the widget's eventHandler eventType is supported.
   */
  private isSupportedWidgetEvent(widget: DashboardWidget): boolean {

    switch(widget.eventHandlers[0].eventType.toLowerCase()) {
      case 'selectevent': return this.canSelect(widget);
      default: return false;
    }
  }

  /**
   * Looks through the list of widgets that are currently being listened to, and
   * uses its 
   * @param widgetEvent The widgetEvent to update using the appropriate BehaviorSubject.
   */
  sendWidgetEvent(widgetEvent: WidgetEvent): void {
    
    for (let listenedToWidget of this.listenedToWidgets) {
      if (widgetEvent.widgetName.toLowerCase() === listenedToWidget.name.toLowerCase()) {
        listenedToWidget.behaviorSubject.next(widgetEvent);
      }
    }
  }

}
