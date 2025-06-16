import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendArchitectComponent } from './suspend-architect.component';

describe('SuspendArchitectComponent', () => {
  let component: SuspendArchitectComponent;
  let fixture: ComponentFixture<SuspendArchitectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendArchitectComponent]
    });
    fixture = TestBed.createComponent(SuspendArchitectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
