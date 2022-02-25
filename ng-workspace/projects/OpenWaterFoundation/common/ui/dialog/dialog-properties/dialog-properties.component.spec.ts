import { HttpClientTestingModule }   from '@angular/common/http/testing';
import { ComponentFixture,
          TestBed }                  from '@angular/core/testing';
import { MatDialogModule,
          MatDialogRef,
          MAT_DIALOG_DATA }          from '@angular/material/dialog';

import { DATA_OBJECT,
          DialogRefMock,
          RASTER_LAYER_ITEM,
          RASTER_LEAFLET_LAYER,
          VECTOR_LAYER_ITEM }        from './dialog-properties-test';
import { DialogPropertiesComponent } from './dialog-properties.component';

import { OwfCommonService }          from '@OpenWaterFoundation/common/services';

import { ShowdownModule }            from 'ngx-showdown';
import { DebugElement }              from '@angular/core';

describe('DialogPropertiesComponent', () => {
  let propertiesComponent: DialogPropertiesComponent;
  let fixture: ComponentFixture<DialogPropertiesComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    const OwfCommonServiceSpy = jasmine.createSpyObj('OwfCommonService',
    [ 'isURL', 'buildPath', 'condensePath', 'setMapConfigPath' ]);

    await TestBed.configureTestingModule({
      declarations: [ DialogPropertiesComponent ],
      imports: [ HttpClientTestingModule, MatDialogModule, ShowdownModule ],
      providers: [
        { provide: MatDialogRef, useClass: DialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: DATA_OBJECT },
        { provide: OwfCommonService, useValue: OwfCommonServiceSpy }
      ]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(DialogPropertiesComponent);
      // Debug element for querying the DOM.
      el = fixture.debugElement;
      // Create the component and manually assign the layerItem property, as it is
      // normally set by a separate helper function and won't be called for this test.
      propertiesComponent = fixture.componentInstance;
    });
  });

  describe('when displaying a vector layer', () => {

    it('should correctly display its properties', () => {
      propertiesComponent.layerItem = VECTOR_LAYER_ITEM;
      // Since the component was created, then the layerItem set, nothing was formatted.
      // Format the properties here.
      propertiesComponent['formatLayerProperties']();
      // Update the changes to the component.
      fixture.detectChanges();

      // Confirm the component was created properly.
      expect(propertiesComponent).toBeTruthy();

      // Ensures a property string contains two backslashes, with each one needing
      // to be escaped itself. This will escape the underscore in the property string.
      expect(propertiesComponent.layerProperties).toEqual([
        "shape\\\\_st\\\\_2",
        "shape\\\\_stle",
        "pop\\\\_2010",
        "co\\\\_fips",
        "county",
        "shape\\\\_st\\\\_1",
        "shape\\\\_star",
        "househo\\\\_20"
      ]);
    });

  });

  describe('when displaying a raster layer', () => {

    it('should correctly display its properties', () => {
      propertiesComponent.layerItem = RASTER_LAYER_ITEM;
      // Since the component was created, then the layerItem set, nothing was formatted.
      // Format the properties here.
      propertiesComponent['formatLayerProperties']();
      // Update the changes to the component.
      spyOn(propertiesComponent.layerItem, 'getItemLeafletLayer').and.returnValue(RASTER_LEAFLET_LAYER);
      fixture.detectChanges();

      expect(propertiesComponent.layerItem).toEqual(RASTER_LAYER_ITEM);

      expect(propertiesComponent.layerItem.getItemLeafletLayer).toHaveBeenCalledTimes(1);
    });
  });

});
