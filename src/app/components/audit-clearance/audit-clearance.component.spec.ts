import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditClearanceComponent } from './audit-clearance.component';

describe('AuditClearanceComponent', () => {
  let component: AuditClearanceComponent;
  let fixture: ComponentFixture<AuditClearanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditClearanceComponent]
    });
    fixture = TestBed.createComponent(AuditClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
