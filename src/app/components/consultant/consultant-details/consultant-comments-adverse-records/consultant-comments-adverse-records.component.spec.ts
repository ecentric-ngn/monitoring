import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantCommentsAdverseRecordsComponent } from './consultant-comments-adverse-records.component';

describe('ConsultantCommentsAdverseRecordsComponent', () => {
  let component: ConsultantCommentsAdverseRecordsComponent;
  let fixture: ComponentFixture<ConsultantCommentsAdverseRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantCommentsAdverseRecordsComponent]
    });
    fixture = TestBed.createComponent(ConsultantCommentsAdverseRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
