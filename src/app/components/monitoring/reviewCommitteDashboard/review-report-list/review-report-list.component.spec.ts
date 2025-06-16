import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewReportListComponent } from './review-report-list.component';

describe('ReviewReportListComponent', () => {
  let component: ReviewReportListComponent;
  let fixture: ComponentFixture<ReviewReportListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewReportListComponent]
    });
    fixture = TestBed.createComponent(ReviewReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
