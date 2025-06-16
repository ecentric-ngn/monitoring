import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantGeneralInformationComponent } from './consultant-general-information.component';

describe('ConsultantGeneralInformationComponent', () => {
  let component: ConsultantGeneralInformationComponent;
  let fixture: ComponentFixture<ConsultantGeneralInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantGeneralInformationComponent]
    });
    fixture = TestBed.createComponent(ConsultantGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
