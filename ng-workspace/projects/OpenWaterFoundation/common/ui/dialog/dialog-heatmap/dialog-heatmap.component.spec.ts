import { ComponentFixture,
          TestBed }               from '@angular/core/testing';
import { MatDialogModule,
          MatDialogRef,
          MAT_DIALOG_DATA }       from '@angular/material/dialog';

import { DialogHeatmapComponent } from './dialog-heatmap.component';

xdescribe('DialogHeatmapComponent', () => {
  let component: DialogHeatmapComponent;
  let fixture: ComponentFixture<DialogHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogHeatmapComponent ],
      imports: [ MatDialogModule ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    // fixture = TestBed.createComponent(DialogHeatmapComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  describe('when unit testing', () => {

  });

  

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
