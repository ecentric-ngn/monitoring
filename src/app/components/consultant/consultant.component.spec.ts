import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantComponent } from './consultant.component';

describe('ConsultantComponent', () => {
  let component: ConsultantComponent;
  let fixture: ComponentFixture<ConsultantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantComponent]
    });
    fixture = TestBed.createComponent(ConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
