import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRegCompliancelistComponent } from './view-reg-compliancelist.component';

describe('ViewRegCompliancelistComponent', () => {
  let component: ViewRegCompliancelistComponent;
  let fixture: ComponentFixture<ViewRegCompliancelistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRegCompliancelistComponent]
    });
    fixture = TestBed.createComponent(ViewRegCompliancelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
