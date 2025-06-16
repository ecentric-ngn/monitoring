import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledEngineerComponent } from './cancelled-engineer.component';

describe('CancelledEngineerComponent', () => {
  let component: CancelledEngineerComponent;
  let fixture: ComponentFixture<CancelledEngineerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledEngineerComponent]
    });
    fixture = TestBed.createComponent(CancelledEngineerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
