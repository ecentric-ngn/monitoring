import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewActiveAppDetailsComponent } from './view-active-app-details.component';

describe('ViewActiveAppDetailsComponent', () => {
  let component: ViewActiveAppDetailsComponent;
  let fixture: ComponentFixture<ViewActiveAppDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewActiveAppDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewActiveAppDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
