import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserTrainingComponent } from './edit-user-training.component';

describe('EditUserTrainingComponent', () => {
  let component: EditUserTrainingComponent;
  let fixture: ComponentFixture<EditUserTrainingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditUserTrainingComponent]
    });
    fixture = TestBed.createComponent(EditUserTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
