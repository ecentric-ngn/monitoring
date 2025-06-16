import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendSurveyorComponent } from './suspend-surveyor.component';

describe('SuspendSurveyorComponent', () => {
  let component: SuspendSurveyorComponent;
  let fixture: ComponentFixture<SuspendSurveyorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendSurveyorComponent]
    });
    fixture = TestBed.createComponent(SuspendSurveyorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
