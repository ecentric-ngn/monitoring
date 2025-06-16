import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccupationalHealthAndSaftyComponent } from './occupational-health-and-safty.component';

describe('OccupationalHealthAndSaftyComponent', () => {
  let component: OccupationalHealthAndSaftyComponent;
  let fixture: ComponentFixture<OccupationalHealthAndSaftyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OccupationalHealthAndSaftyComponent]
    });
    fixture = TestBed.createComponent(OccupationalHealthAndSaftyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
