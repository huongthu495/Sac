import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SacBee } from './sac-bee';

describe('SacBee', () => {
  let component: SacBee;
  let fixture: ComponentFixture<SacBee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SacBee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SacBee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
