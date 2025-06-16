import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantEquipmentComponent } from './consultant-equipment.component';

describe('ConsultantEquipmentComponent', () => {
  let component: ConsultantEquipmentComponent;
  let fixture: ComponentFixture<ConsultantEquipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantEquipmentComponent]
    });
    fixture = TestBed.createComponent(ConsultantEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
