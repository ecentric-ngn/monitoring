import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOFHRinContractComponent } from './list-ofhrin-contract.component';

describe('ListOFHRinContractComponent', () => {
  let component: ListOFHRinContractComponent;
  let fixture: ComponentFixture<ListOFHRinContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListOFHRinContractComponent]
    });
    fixture = TestBed.createComponent(ListOFHRinContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
