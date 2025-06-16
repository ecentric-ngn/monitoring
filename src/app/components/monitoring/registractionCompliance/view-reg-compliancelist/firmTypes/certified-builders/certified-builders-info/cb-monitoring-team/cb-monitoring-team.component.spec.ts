import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbMonitoringTeamComponent } from './cb-monitoring-team.component';

describe('CbMonitoringTeamComponent', () => {
  let component: CbMonitoringTeamComponent;
  let fixture: ComponentFixture<CbMonitoringTeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CbMonitoringTeamComponent]
    });
    fixture = TestBed.createComponent(CbMonitoringTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
