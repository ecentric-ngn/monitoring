import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledConsultantComponent } from './cancelled-consultant.component';

describe('CancelledConsultantComponent', () => {
  let component: CancelledConsultantComponent;
  let fixture: ComponentFixture<CancelledConsultantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledConsultantComponent]
    });
    fixture = TestBed.createComponent(CancelledConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
