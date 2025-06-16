import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectDetailComponent } from './architect-detail.component';

describe('ArchitectDetailComponent', () => {
  let component: ArchitectDetailComponent;
  let fixture: ComponentFixture<ArchitectDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchitectDetailComponent]
    });
    fixture = TestBed.createComponent(ArchitectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
