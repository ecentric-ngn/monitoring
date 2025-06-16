import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbMandatoryEquipmentComponent } from './cb-mandatory-equipment.component';

describe('CbMandatoryEquipmentComponent', () => {
  let component: CbMandatoryEquipmentComponent;
  let fixture: ComponentFixture<CbMandatoryEquipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CbMandatoryEquipmentComponent]
    });
    fixture = TestBed.createComponent(CbMandatoryEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
