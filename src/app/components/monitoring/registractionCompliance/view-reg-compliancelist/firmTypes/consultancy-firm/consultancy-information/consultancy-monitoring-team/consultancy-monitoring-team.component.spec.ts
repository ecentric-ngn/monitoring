import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultancyMonitoringTeamComponent } from './consultancy-monitoring-team.component';

describe('ConsultancyMonitoringTeamComponent', () => {
  let component: ConsultancyMonitoringTeamComponent;
  let fixture: ComponentFixture<ConsultancyMonitoringTeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultancyMonitoringTeamComponent]
    });
    fixture = TestBed.createComponent(ConsultancyMonitoringTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
