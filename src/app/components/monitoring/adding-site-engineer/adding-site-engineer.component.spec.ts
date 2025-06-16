import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddingSiteEngineerComponent } from './adding-site-engineer.component';

describe('AddingSiteEngineerComponent', () => {
  let component: AddingSiteEngineerComponent;
  let fixture: ComponentFixture<AddingSiteEngineerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddingSiteEngineerComponent]
    });
    fixture = TestBed.createComponent(AddingSiteEngineerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
