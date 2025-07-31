import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCancelAppDetailsComponent } from './view-cancel-app-details.component';

describe('ViewCancelAppDetailsComponent', () => {
  let component: ViewCancelAppDetailsComponent;
  let fixture: ComponentFixture<ViewCancelAppDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCancelAppDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewCancelAppDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
