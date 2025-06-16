import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledArchitectComponent } from './cancelled-architect.component';

describe('CancelledArchitectComponent', () => {
  let component: CancelledArchitectComponent;
  let fixture: ComponentFixture<CancelledArchitectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledArchitectComponent]
    });
    fixture = TestBed.createComponent(CancelledArchitectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
