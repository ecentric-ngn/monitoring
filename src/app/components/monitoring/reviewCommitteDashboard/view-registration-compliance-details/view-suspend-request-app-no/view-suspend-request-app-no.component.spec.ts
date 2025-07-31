import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSuspendRequestAppNoComponent } from './view-suspend-request-app-no.component';

describe('ViewSuspendRequestAppNoComponent', () => {
  let component: ViewSuspendRequestAppNoComponent;
  let fixture: ComponentFixture<ViewSuspendRequestAppNoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSuspendRequestAppNoComponent]
    });
    fixture = TestBed.createComponent(ViewSuspendRequestAppNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
