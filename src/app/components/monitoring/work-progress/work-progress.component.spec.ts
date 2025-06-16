import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkProgressComponent } from './work-progress.component';

describe('WorkProgressComponent', () => {
  let component: WorkProgressComponent;
  let fixture: ComponentFixture<WorkProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkProgressComponent]
    });
    fixture = TestBed.createComponent(WorkProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
