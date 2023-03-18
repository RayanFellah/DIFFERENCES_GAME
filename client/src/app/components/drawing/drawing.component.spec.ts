import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingComponent } from './drawing.component';

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        // create a mock canvas element and provide it to the component
        const canvas = document.createElement('canvas');
        component.canvas = canvas;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
