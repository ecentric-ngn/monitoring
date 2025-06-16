import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultancyInformationComponent } from './consultancy-information.component';

describe('ConsultancyInformationComponent', () => {
  let component: ConsultancyInformationComponent;
  let fixture: ComponentFixture<ConsultancyInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultancyInformationComponent]
    });
    fixture = TestBed.createComponent(ConsultancyInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
