import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendConsultantComponent } from './suspend-consultant.component';

describe('SuspendConsultantComponent', () => {
  let component: SuspendConsultantComponent;
  let fixture: ComponentFixture<SuspendConsultantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendConsultantComponent]
    });
    fixture = TestBed.createComponent(SuspendConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
