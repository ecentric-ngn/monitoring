import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfMonitoringTeamComponent } from './sf-monitoring-team.component';

describe('SfMonitoringTeamComponent', () => {
  let component: SfMonitoringTeamComponent;
  let fixture: ComponentFixture<SfMonitoringTeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SfMonitoringTeamComponent]
    });
    fixture = TestBed.createComponent(SfMonitoringTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
