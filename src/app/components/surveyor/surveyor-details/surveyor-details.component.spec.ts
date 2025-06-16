import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyorDetailsComponent } from './surveyor-details.component';

describe('SurveyorDetailsComponent', () => {
  let component: SurveyorDetailsComponent;
  let fixture: ComponentFixture<SurveyorDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyorDetailsComponent]
    });
    fixture = TestBed.createComponent(SurveyorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
