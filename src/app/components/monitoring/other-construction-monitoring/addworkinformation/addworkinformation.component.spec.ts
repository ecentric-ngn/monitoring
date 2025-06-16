import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddworkinformationComponent } from './addworkinformation.component';

describe('AddworkinformationComponent', () => {
  let component: AddworkinformationComponent;
  let fixture: ComponentFixture<AddworkinformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddworkinformationComponent]
    });
    fixture = TestBed.createComponent(AddworkinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
