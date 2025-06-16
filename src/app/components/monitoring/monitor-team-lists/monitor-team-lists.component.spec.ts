import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorTeamListsComponent } from './monitor-team-lists.component';

describe('MonitorTeamListsComponent', () => {
  let component: MonitorTeamListsComponent;
  let fixture: ComponentFixture<MonitorTeamListsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonitorTeamListsComponent]
    });
    fixture = TestBed.createComponent(MonitorTeamListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
