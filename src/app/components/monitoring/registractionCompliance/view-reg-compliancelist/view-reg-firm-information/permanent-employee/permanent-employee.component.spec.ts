import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermanentEmployeeComponent } from './permanent-employee.component';

describe('PermanentEmployeeComponent', () => {
  let component: PermanentEmployeeComponent;
  let fixture: ComponentFixture<PermanentEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PermanentEmployeeComponent]
    });
    fixture = TestBed.createComponent(PermanentEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
