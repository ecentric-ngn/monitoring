import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringTeamUsersComponent } from './monitoring-team-users.component';

describe('MonitoringTeamUsersComponent', () => {
  let component: MonitoringTeamUsersComponent;
  let fixture: ComponentFixture<MonitoringTeamUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonitoringTeamUsersComponent]
    });
    fixture = TestBed.createComponent(MonitoringTeamUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
