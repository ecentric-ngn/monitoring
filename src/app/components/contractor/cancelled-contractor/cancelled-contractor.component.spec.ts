import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledContractorComponent } from './cancelled-contractor.component';

describe('CancelledContractorComponent', () => {
  let component: CancelledContractorComponent;
  let fixture: ComponentFixture<CancelledContractorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledContractorComponent]
    });
    fixture = TestBed.createComponent(CancelledContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
