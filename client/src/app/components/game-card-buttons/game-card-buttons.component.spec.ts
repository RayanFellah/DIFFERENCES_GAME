import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCardButtonsComponent } from './game-card-buttons.component';

describe('GameCardButtonsComponent', () => {
  let component: GameCardButtonsComponent;
  let fixture: ComponentFixture<GameCardButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameCardButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameCardButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
