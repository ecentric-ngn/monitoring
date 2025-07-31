import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCancelRequestAppNoComponent } from './view-cancel-request-app-no.component';

describe('ViewCancelRequestAppNoComponent', () => {
  let component: ViewCancelRequestAppNoComponent;
  let fixture: ComponentFixture<ViewCancelRequestAppNoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCancelRequestAppNoComponent]
    });
    fixture = TestBed.createComponent(ViewCancelRequestAppNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
