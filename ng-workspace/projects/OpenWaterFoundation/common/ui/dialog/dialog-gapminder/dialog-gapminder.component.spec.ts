import { HttpClientModule }         from '@angular/common/http';
import { ComponentFixture,
          TestBed }                 from '@angular/core/testing';

import { DialogGapminderComponent } from './dialog-gapminder.component';

xdescribe('DialogGapminderComponent', () => {
  let component: DialogGapminderComponent;
  let fixture: ComponentFixture<DialogGapminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogGapminderComponent ],
      imports: [ HttpClientModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    // fixture = TestBed.createComponent(DialogGapminderComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
