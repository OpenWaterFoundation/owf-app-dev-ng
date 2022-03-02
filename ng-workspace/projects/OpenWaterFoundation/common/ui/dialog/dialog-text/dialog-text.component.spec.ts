import { ComponentFixture,
          TestBed }            from '@angular/core/testing';
import { MatDialogModule,
          MatDialogRef,
          MAT_DIALOG_DATA }    from '@angular/material/dialog';

import { DialogTextComponent } from './dialog-text.component';

xdescribe('DialogTextComponent', () => {
  let component: DialogTextComponent;
  let fixture: ComponentFixture<DialogTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTextComponent ],
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
    // fixture = TestBed.createComponent(DialogTextComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
