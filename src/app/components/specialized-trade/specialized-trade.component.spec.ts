import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedTradeComponent } from './specialized-trade.component';

describe('SpecializedTradeComponent', () => {
  let component: SpecializedTradeComponent;
  let fixture: ComponentFixture<SpecializedTradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedTradeComponent]
    });
    fixture = TestBed.createComponent(SpecializedTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
