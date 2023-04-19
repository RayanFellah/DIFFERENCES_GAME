/* eslint-disable max-len */
import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { BehaviorSubject } from 'rxjs';

import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ImageHttpService } from '@app/services/image-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Observable } from 'rxjs';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    const imageHttpSpy = jasmine.createSpyObj('ImageHttpService', ['getImageUrl', 'getImage']);
    imageHttpSpy.getImage.and.returnValue(new Observable());
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['send']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            providers: [
                { provide: ImageHttpService, useValue: imageHttpSpy },
                { provide: DomSanitizer, useValue: sanitizerSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SocketClientService, useValue: socketServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.sheet = {
            _id: 'abc123',
            title: 'Test Game',
            originalImagePath: 'https://example.com/test-image1.bmp',
            modifiedImagePath: 'https://example.com/test-image2.bmp',
            difficulty: 'easy',
            radius: 3,
            differences: 7,
            isJoinable: false,
            top3Multi: [],
            top3Solo: [],
        };
        component.isConfig = false;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(imageHttpSpy['getImage']).toHaveBeenCalledWith(component.sheet.originalImagePath);
        expect(component).toBeTruthy();
    });
    it('should navigate', () => {
        spyOn(component.shouldNavigate$, 'next');
        component.navigate(true);
        expect(component.shouldNavigate$.next).toHaveBeenCalledWith(true);
    });

    it('should emit createEvent with valid player name and sheet id', () => {
        const spyCreate = spyOn(component.createEvent, 'emit');
        const spyNavigate = spyOn(component, 'navigate');

        spyOn(window, 'prompt').and.returnValue('test name');
        component.create();
        expect(spyNavigate).toHaveBeenCalledWith(false);
        expect(spyCreate).toHaveBeenCalledWith({ playerName: 'test name', sheetId: component.sheet._id });
    });

    // it('should show alert when playerName is invalid', () => {
    //     const alertSpy = spyOn(window, 'alert');
    //     spyOn(window, 'prompt').and.returnValue('123');
    //     const spyNavigate = spyOn(component, 'navigate');
    //     const spyCreate = spyOn(component.createEvent, 'emit');

    //     component.create();

    //     expect(alertSpy).toHaveBeenCalledWith("Le nom d'utilisateur ne peut pas Ãªtre vide, ne peut pas contenir que des chiffres ou des espaces.");
    //     expect(spyNavigate).not.toHaveBeenCalled();
    //     expect(spyCreate).not.toHaveBeenCalled();
    // });

    // it('should join the game with valid input', () => {
    //     // Mock the window.prompt method
    //     spyOn(window, 'prompt').and.returnValue('Test Player');
    //     const spy = spyOn(component.joinEvent, 'emit');
    //     component.join();

    //     // Expect that the output event has been emitted
    //     expect(spy).toHaveBeenCalledWith({ playerName: 'Test Player', sheetId: component.sheet._id });
    // });

    // it('should not join the game with invalid input', () => {
    //     // Mock the window.prompt method
    //     const invalidName = '';
    //     const spyWindow = spyOn(window, 'prompt').and.returnValue(invalidName);
    //     const spyAlert = spyOn(window, 'alert');
    //     const spy = spyOn(component.joinEvent, 'emit');
    //     component.join();
    //     expect(spy).not.toHaveBeenCalled();
    //     expect(spyWindow).toHaveBeenCalledWith('What is your name?');
    //     expect(spyAlert).toHaveBeenCalledWith("Le nom d'utilisateur ne peut pas Ãªtre vide, ne peut pas contenir que des chiffres ou des espaces.");
    // });
    it('should create solo game', () => {
        const playerName = 'Test Player';
        const length = 10;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const randomId = spyOn<any>(component, 'generateRandomId').and.returnValue('1234567890');
        component['createSoloGame'](playerName);
        expect(component.roomName).toBe('1234567890');
        expect(randomId).toHaveBeenCalledWith(length);
        expect(socketServiceSpy['send']).toHaveBeenCalledWith('createSoloGame', {
            name: playerName,
            sheetId: component.sheet._id,
            roomName: '1234567890',
        });
    });

    it('should generate a random string of specified length', () => {
        const length = 10;
        const randomString = component['generateRandomId'](length);
        expect(randomString.length).toEqual(length);

        // Test that each character in the random string is from the allowed characters
        const allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            expect(allowedCharacters).toContain(randomString.charAt(i));
        }
    });

    it('should emit delete event', () => {
        const spy = spyOn(component.delete, 'emit');
        component.onDelete();
        expect(spy).toHaveBeenCalled();
    });
});
