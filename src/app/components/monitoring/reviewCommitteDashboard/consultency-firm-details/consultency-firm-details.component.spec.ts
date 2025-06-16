import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultencyFirmDetailsComponent } from './consultency-firm-details.component';

describe('ConsultencyFirmDetailsComponent', () => {
  let component: ConsultencyFirmDetailsComponent;
  let fixture: ComponentFixture<ConsultencyFirmDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultencyFirmDetailsComponent]
    });
    fixture = TestBed.createComponent(ConsultencyFirmDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
