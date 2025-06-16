import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyorRecordComponent } from './surveyor-record.component';

describe('SurveyorRecordComponent', () => {
  let component: SurveyorRecordComponent;
  let fixture: ComponentFixture<SurveyorRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyorRecordComponent]
    });
    fixture = TestBed.createComponent(SurveyorRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
