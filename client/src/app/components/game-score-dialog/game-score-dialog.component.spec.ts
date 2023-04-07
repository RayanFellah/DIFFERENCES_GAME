import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameScoreDialogComponent } from './game-score-dialog.component';

describe('GameScoreDialogComponent', () => {
  let component: GameScoreDialogComponent;
  let fixture: ComponentFixture<GameScoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameScoreDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameScoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
