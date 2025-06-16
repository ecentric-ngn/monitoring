import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherConstructionMonitoringComponent } from './other-construction-monitoring.component';

describe('OtherConstructionMonitoringComponent', () => {
  let component: OtherConstructionMonitoringComponent;
  let fixture: ComponentFixture<OtherConstructionMonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtherConstructionMonitoringComponent]
    });
    fixture = TestBed.createComponent(OtherConstructionMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
