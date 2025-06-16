import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSpecializeDetailsComponent } from './view-specialize-details.component';

describe('ViewSpecializeDetailsComponent', () => {
  let component: ViewSpecializeDetailsComponent;
  let fixture: ComponentFixture<ViewSpecializeDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSpecializeDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewSpecializeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
