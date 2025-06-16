import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAuditClearanceComponent } from './add-audit-clearance.component';

describe('AddAuditClearanceComponent', () => {
  let component: AddAuditClearanceComponent;
  let fixture: ComponentFixture<AddAuditClearanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAuditClearanceComponent]
    });
    fixture = TestBed.createComponent(AddAuditClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
