import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReinforcementComponent } from './reinforcement.component';

describe('ReinforcementComponent', () => {
  let component: ReinforcementComponent;
  let fixture: ComponentFixture<ReinforcementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReinforcementComponent]
    });
    fixture = TestBed.createComponent(ReinforcementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
