import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMonitoredSiteAppComponent } from './view-monitored-site-app.component';

describe('ViewMonitoredSiteAppComponent', () => {
  let component: ViewMonitoredSiteAppComponent;
  let fixture: ComponentFixture<ViewMonitoredSiteAppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewMonitoredSiteAppComponent]
    });
    fixture = TestBed.createComponent(ViewMonitoredSiteAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
