import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogHeatmapComponent } from './dialog-heatmap.component';

describe('DialogTextComponent', () => {
  let component: DialogHeatmapComponent;
  let fixture: ComponentFixture<DialogHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogHeatmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
