import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDocumentComponent } from './contract-document.component';

describe('ContractDocumentComponent', () => {
  let component: ContractDocumentComponent;
  let fixture: ComponentFixture<ContractDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContractDocumentComponent]
    });
    fixture = TestBed.createComponent(ContractDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
