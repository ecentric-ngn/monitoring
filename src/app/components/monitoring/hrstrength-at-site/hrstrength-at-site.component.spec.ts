import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HRStrengthAtSiteComponent } from './hrstrength-at-site.component';

describe('HRStrengthAtSiteComponent', () => {
  let component: HRStrengthAtSiteComponent;
  let fixture: ComponentFixture<HRStrengthAtSiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HRStrengthAtSiteComponent]
    });
    fixture = TestBed.createComponent(HRStrengthAtSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
