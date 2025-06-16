import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendContractorComponent } from './suspend-contractor.component';

describe('SuspendContractorComponent', () => {
  let component: SuspendContractorComponent;
  let fixture: ComponentFixture<SuspendContractorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendContractorComponent]
    });
    fixture = TestBed.createComponent(SuspendContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
