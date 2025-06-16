import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnsiteFacilitiesandManagementComponent } from './onsite-facilitiesand-management.component';

describe('OnsiteFacilitiesandManagementComponent', () => {
  let component: OnsiteFacilitiesandManagementComponent;
  let fixture: ComponentFixture<OnsiteFacilitiesandManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnsiteFacilitiesandManagementComponent]
    });
    fixture = TestBed.createComponent(OnsiteFacilitiesandManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
