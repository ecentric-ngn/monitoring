import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRegistrationComplianceDetailsComponent } from './view-registration-compliance-details.component';

describe('ViewRegistrationComplianceDetailsComponent', () => {
  let component: ViewRegistrationComplianceDetailsComponent;
  let fixture: ComponentFixture<ViewRegistrationComplianceDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRegistrationComplianceDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewRegistrationComplianceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
