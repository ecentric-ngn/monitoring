import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTaskQuantityComponent } from './work-task-quantity.component';

describe('WorkTaskQuantityComponent', () => {
  let component: WorkTaskQuantityComponent;
  let fixture: ComponentFixture<WorkTaskQuantityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkTaskQuantityComponent]
    });
    fixture = TestBed.createComponent(WorkTaskQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
