import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwfCommonComponent } from './owf-common.component';

describe('OwfCommonComponent', () => {
  let component: OwfCommonComponent;
  let fixture: ComponentFixture<OwfCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwfCommonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwfCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
