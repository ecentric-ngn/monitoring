import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantWorkClassificationComponent } from './consultant-work-classification.component';

describe('ConsultantWorkClassificationComponent', () => {
  let component: ConsultantWorkClassificationComponent;
  let fixture: ComponentFixture<ConsultantWorkClassificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantWorkClassificationComponent]
    });
    fixture = TestBed.createComponent(ConsultantWorkClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
