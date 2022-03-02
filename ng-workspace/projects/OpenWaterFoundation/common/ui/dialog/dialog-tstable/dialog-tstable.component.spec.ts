import { HttpClientModule }       from '@angular/common/http';
import { ComponentFixture,
          TestBed }               from '@angular/core/testing';
import { MatDialogModule,
          MatDialogRef,
          MAT_DIALOG_DATA }       from '@angular/material/dialog';


import { DialogTSTableComponent } from './dialog-tstable.component';

xdescribe('DialogTSTableComponent', () => {
  let component: DialogTSTableComponent;
  let fixture: ComponentFixture<DialogTSTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTSTableComponent ],
      imports: [ HttpClientModule, MatDialogModule ],
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
    // fixture = TestBed.createComponent(DialogTSTableComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
