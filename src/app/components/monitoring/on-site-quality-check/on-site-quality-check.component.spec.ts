import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSiteQualityCheckComponent } from './on-site-quality-check.component';

describe('OnSiteQualityCheckComponent', () => {
  let component: OnSiteQualityCheckComponent;
  let fixture: ComponentFixture<OnSiteQualityCheckComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnSiteQualityCheckComponent]
    });
    fixture = TestBed.createComponent(OnSiteQualityCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
