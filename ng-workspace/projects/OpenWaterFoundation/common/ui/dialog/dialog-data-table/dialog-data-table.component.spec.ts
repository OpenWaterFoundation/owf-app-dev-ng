import { HttpClientModule }         from '@angular/common/http';
import { ComponentFixture,
          TestBed }                 from '@angular/core/testing';

import { DialogDataTableComponent } from './dialog-data-table.component';

xdescribe('DialogDataTableComponent', () => {
  let component: DialogDataTableComponent;
  let fixture: ComponentFixture<DialogDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDataTableComponent ],
      imports: [ HttpClientModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    // fixture = TestBed.createComponent(DialogDataTableComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
