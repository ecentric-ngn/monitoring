import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorPresentDuringSiteMonitoringComponent } from './contractor-present-during-site-monitoring.component';

describe('ContractorPresentDuringSiteMonitoringComponent', () => {
  let component: ContractorPresentDuringSiteMonitoringComponent;
  let fixture: ComponentFixture<ContractorPresentDuringSiteMonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContractorPresentDuringSiteMonitoringComponent]
    });
    fixture = TestBed.createComponent(ContractorPresentDuringSiteMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
