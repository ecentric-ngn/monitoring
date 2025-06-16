import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantOwnerInformationComponent } from './consultant-owner-information.component';

describe('ConsultantOwnerInformationComponent', () => {
  let component: ConsultantOwnerInformationComponent;
  let fixture: ComponentFixture<ConsultantOwnerInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantOwnerInformationComponent]
    });
    fixture = TestBed.createComponent(ConsultantOwnerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
