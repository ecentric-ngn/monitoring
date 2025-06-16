import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSubmittedReportListComponent } from './view-submitted-report-list.component';

describe('ViewSubmittedReportListComponent', () => {
  let component: ViewSubmittedReportListComponent;
  let fixture: ComponentFixture<ViewSubmittedReportListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSubmittedReportListComponent]
    });
    fixture = TestBed.createComponent(ViewSubmittedReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
