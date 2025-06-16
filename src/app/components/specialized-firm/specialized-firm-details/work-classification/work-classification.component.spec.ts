import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkClassificationComponent } from './work-classification.component';

describe('WorkClassificationComponent', () => {
  let component: WorkClassificationComponent;
  let fixture: ComponentFixture<WorkClassificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkClassificationComponent]
    });
    fixture = TestBed.createComponent(WorkClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
