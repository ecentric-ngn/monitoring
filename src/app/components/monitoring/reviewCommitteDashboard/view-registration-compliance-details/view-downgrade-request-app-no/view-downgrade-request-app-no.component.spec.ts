import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDowngradeRequestAppNoComponent } from './view-downgrade-request-app-no.component';

describe('ViewDowngradeRequestAppNoComponent', () => {
  let component: ViewDowngradeRequestAppNoComponent;
  let fixture: ComponentFixture<ViewDowngradeRequestAppNoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDowngradeRequestAppNoComponent]
    });
    fixture = TestBed.createComponent(ViewDowngradeRequestAppNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
