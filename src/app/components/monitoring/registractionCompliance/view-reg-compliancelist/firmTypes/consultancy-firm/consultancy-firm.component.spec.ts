import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultancyFirmComponent } from './consultancy-firm.component';

describe('ConsultancyFirmComponent', () => {
  let component: ConsultancyFirmComponent;
  let fixture: ComponentFixture<ConsultancyFirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultancyFirmComponent]
    });
    fixture = TestBed.createComponent(ConsultancyFirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
