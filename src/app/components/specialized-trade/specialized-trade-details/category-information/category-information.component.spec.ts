import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryInformationComponent } from './category-information.component';

describe('CategoryInformationComponent', () => {
  let component: CategoryInformationComponent;
  let fixture: ComponentFixture<CategoryInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryInformationComponent]
    });
    fixture = TestBed.createComponent(CategoryInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
