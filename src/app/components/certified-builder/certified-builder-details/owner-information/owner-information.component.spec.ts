import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerInformationComponent } from './owner-information.component';

describe('OwnerInformationComponent', () => {
  let component: OwnerInformationComponent;
  let fixture: ComponentFixture<OwnerInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OwnerInformationComponent]
    });
    fixture = TestBed.createComponent(OwnerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
