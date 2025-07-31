import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSuspendAppDetailsComponent } from './view-suspend-app-details.component';

describe('ViewSuspendAppDetailsComponent', () => {
  let component: ViewSuspendAppDetailsComponent;
  let fixture: ComponentFixture<ViewSuspendAppDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSuspendAppDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewSuspendAppDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
