import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCertifiedDetailsComponent } from './view-certified-details.component';

describe('ViewCertifiedDetailsComponent', () => {
  let component: ViewCertifiedDetailsComponent;
  let fixture: ComponentFixture<ViewCertifiedDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCertifiedDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewCertifiedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
