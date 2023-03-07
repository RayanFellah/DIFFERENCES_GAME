import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCardGridComponent } from './game-card-grid.component';

describe('GameCardGridComponent', () => {
    let component: GameCardGridComponent;
    let fixture: ComponentFixture<GameCardGridComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardGridComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
