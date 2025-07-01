import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionModalConstructionComponent } from './action-modal-construction.component';

describe('ActionModalConstructionComponent', () => {
  let component: ActionModalConstructionComponent;
  let fixture: ComponentFixture<ActionModalConstructionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActionModalConstructionComponent]
    });
    fixture = TestBed.createComponent(ActionModalConstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
