import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommittedEquipmentComponent } from './committed-equipment.component';

describe('CommittedEquipmentComponent', () => {
  let component: CommittedEquipmentComponent;
  let fixture: ComponentFixture<CommittedEquipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommittedEquipmentComponent]
    });
    fixture = TestBed.createComponent(CommittedEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
