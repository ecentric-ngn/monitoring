import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PocuringAgencyWorkListComponent } from './pocuring-agency-work-list.component';

describe('PocuringAgencyWorkListComponent', () => {
  let component: PocuringAgencyWorkListComponent;
  let fixture: ComponentFixture<PocuringAgencyWorkListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PocuringAgencyWorkListComponent]
    });
    fixture = TestBed.createComponent(PocuringAgencyWorkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
