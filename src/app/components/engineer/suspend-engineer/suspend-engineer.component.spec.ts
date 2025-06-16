import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendEngineerComponent } from './suspend-engineer.component';

describe('SuspendEngineerComponent', () => {
  let component: SuspendEngineerComponent;
  let fixture: ComponentFixture<SuspendEngineerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendEngineerComponent]
    });
    fixture = TestBed.createComponent(SuspendEngineerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
