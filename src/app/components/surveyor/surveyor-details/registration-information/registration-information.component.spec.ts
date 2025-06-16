import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationInformationComponent } from './registration-information.component';

describe('RegistrationInformationComponent', () => {
  let component: RegistrationInformationComponent;
  let fixture: ComponentFixture<RegistrationInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrationInformationComponent]
    });
    fixture = TestBed.createComponent(RegistrationInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
