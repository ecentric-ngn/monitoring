import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledSurveyorComponent } from './cancelled-surveyor.component';

describe('CancelledSurveyorComponent', () => {
  let component: CancelledSurveyorComponent;
  let fixture: ComponentFixture<CancelledSurveyorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledSurveyorComponent]
    });
    fixture = TestBed.createComponent(CancelledSurveyorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
