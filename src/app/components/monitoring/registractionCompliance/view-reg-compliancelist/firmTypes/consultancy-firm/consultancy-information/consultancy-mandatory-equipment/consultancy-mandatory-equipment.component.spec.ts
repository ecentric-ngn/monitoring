import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultancyMandatoryEquipmentComponent } from './consultancy-mandatory-equipment.component';

describe('ConsultancyMandatoryEquipmentComponent', () => {
  let component: ConsultancyMandatoryEquipmentComponent;
  let fixture: ComponentFixture<ConsultancyMandatoryEquipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultancyMandatoryEquipmentComponent]
    });
    fixture = TestBed.createComponent(ConsultancyMandatoryEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
