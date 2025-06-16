import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbOfficeSignageComponent } from './cb-office-signage.component';

describe('CbOfficeSignageComponent', () => {
  let component: CbOfficeSignageComponent;
  let fixture: ComponentFixture<CbOfficeSignageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CbOfficeSignageComponent]
    });
    fixture = TestBed.createComponent(CbOfficeSignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
