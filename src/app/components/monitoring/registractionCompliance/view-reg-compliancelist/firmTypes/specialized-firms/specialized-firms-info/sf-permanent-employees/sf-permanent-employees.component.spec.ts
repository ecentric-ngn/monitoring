import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfPermanentEmployeesComponent } from './sf-permanent-employees.component';

describe('SfPermanentEmployeesComponent', () => {
  let component: SfPermanentEmployeesComponent;
  let fixture: ComponentFixture<SfPermanentEmployeesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SfPermanentEmployeesComponent]
    });
    fixture = TestBed.createComponent(SfPermanentEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
