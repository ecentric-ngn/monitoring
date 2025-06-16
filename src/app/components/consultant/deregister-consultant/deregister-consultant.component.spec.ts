import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeregisterConsultantComponent } from './deregister-consultant.component';

describe('DeregisterConsultantComponent', () => {
  let component: DeregisterConsultantComponent;
  let fixture: ComponentFixture<DeregisterConsultantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeregisterConsultantComponent]
    });
    fixture = TestBed.createComponent(DeregisterConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
