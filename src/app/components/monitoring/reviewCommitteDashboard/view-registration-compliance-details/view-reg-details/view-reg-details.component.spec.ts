import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRegDetailsComponent } from './view-reg-details.component';

describe('ViewRegDetailsComponent', () => {
  let component: ViewRegDetailsComponent;
  let fixture: ComponentFixture<ViewRegDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRegDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewRegDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
