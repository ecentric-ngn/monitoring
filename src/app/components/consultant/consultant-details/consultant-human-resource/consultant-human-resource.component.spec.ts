import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantHumanResourceComponent } from './consultant-human-resource.component';

describe('ConsultantHumanResourceComponent', () => {
  let component: ConsultantHumanResourceComponent;
  let fixture: ComponentFixture<ConsultantHumanResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantHumanResourceComponent]
    });
    fixture = TestBed.createComponent(ConsultantHumanResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
