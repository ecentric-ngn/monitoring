import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRegFirmInformationComponent } from './view-reg-firm-information.component';

describe('ViewRegFirmInformationComponent', () => {
  let component: ViewRegFirmInformationComponent;
  let fixture: ComponentFixture<ViewRegFirmInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRegFirmInformationComponent]
    });
    fixture = TestBed.createComponent(ViewRegFirmInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
