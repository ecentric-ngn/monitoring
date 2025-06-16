import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendedSpecializedTradeComponent } from './suspended-specialized-trade.component';

describe('SuspendedSpecializedTradeComponent', () => {
  let component: SuspendedSpecializedTradeComponent;
  let fixture: ComponentFixture<SuspendedSpecializedTradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendedSpecializedTradeComponent]
    });
    fixture = TestBed.createComponent(SuspendedSpecializedTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
