import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeRegisterContractorComponent } from './de-register-contractor.component';

describe('DeRegisterContractorComponent', () => {
  let component: DeRegisterContractorComponent;
  let fixture: ComponentFixture<DeRegisterContractorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeRegisterContractorComponent]
    });
    fixture = TestBed.createComponent(DeRegisterContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
