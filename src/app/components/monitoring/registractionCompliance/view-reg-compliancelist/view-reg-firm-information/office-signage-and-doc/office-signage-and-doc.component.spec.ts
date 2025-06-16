import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeSignageAndDocComponent } from './office-signage-and-doc.component';

describe('OfficeSignageAndDocComponent', () => {
  let component: OfficeSignageAndDocComponent;
  let fixture: ComponentFixture<OfficeSignageAndDocComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeSignageAndDocComponent]
    });
    fixture = TestBed.createComponent(OfficeSignageAndDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
