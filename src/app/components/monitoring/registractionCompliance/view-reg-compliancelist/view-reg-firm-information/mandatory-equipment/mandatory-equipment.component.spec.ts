import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandatoryEquipmentComponent } from './mandatory-equipment.component';

describe('MandatoryEquipmentComponent', () => {
  let component: MandatoryEquipmentComponent;
  let fixture: ComponentFixture<MandatoryEquipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MandatoryEquipmentComponent]
    });
    fixture = TestBed.createComponent(MandatoryEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
