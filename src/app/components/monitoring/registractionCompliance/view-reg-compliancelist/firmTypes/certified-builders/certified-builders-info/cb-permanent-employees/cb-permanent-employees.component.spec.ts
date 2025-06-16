import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbPermanentEmployeesComponent } from './cb-permanent-employees.component';

describe('CbPermanentEmployeesComponent', () => {
  let component: CbPermanentEmployeesComponent;
  let fixture: ComponentFixture<CbPermanentEmployeesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CbPermanentEmployeesComponent]
    });
    fixture = TestBed.createComponent(CbPermanentEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
