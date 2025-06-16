import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAuditClearanceComponent } from './edit-audit-clearance.component';

describe('EditAuditClearanceComponent', () => {
  let component: EditAuditClearanceComponent;
  let fixture: ComponentFixture<EditAuditClearanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditAuditClearanceComponent]
    });
    fixture = TestBed.createComponent(EditAuditClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
