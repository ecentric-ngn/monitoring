import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeSignageComponent } from './office-signage.component';

describe('OfficeSignageComponent', () => {
  let component: OfficeSignageComponent;
  let fixture: ComponentFixture<OfficeSignageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeSignageComponent]
    });
    fixture = TestBed.createComponent(OfficeSignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
