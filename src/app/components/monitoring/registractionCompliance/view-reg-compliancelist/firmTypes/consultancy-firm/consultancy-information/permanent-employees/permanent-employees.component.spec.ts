import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermanentEmployeesComponent } from './permanent-employees.component';

describe('PermanentEmployeesComponent', () => {
  let component: PermanentEmployeesComponent;
  let fixture: ComponentFixture<PermanentEmployeesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PermanentEmployeesComponent]
    });
    fixture = TestBed.createComponent(PermanentEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
