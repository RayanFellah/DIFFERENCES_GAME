/* eslint-disable no-restricted-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { JoinLoadingDialogComponent } from '@app/components/join-loading-dialog/join-loading-dialog.component';
import { LoadingDialogComponent } from '@app/components/loading-dialog/loading-dialog.component';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { HEIGHT, WIDTH } from 'src/constants';
import { GameOverDialogComponent } from '../game-over-dialog/game-over-dialog.component';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
    let component: DialogComponent;
    let fixture: ComponentFixture<DialogComponent>;
    let mockMatDialog: MatDialog;
    let mockDialogService: DialogService;

    beforeEach(() => {
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockDialogService = new DialogService();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: DialogService, useValue: mockDialogService },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('openImageDialog', () => {
        it('should open image dialog with provided URL and dimensions', () => {
            const imageUrl = 'https://example.com/image.jpg';
            component.openImageDialog(imageUrl);
            expect(mockMatDialog.open).toHaveBeenCalledWith(ImageDialogComponent, {
                data: { imageUrl },
                maxWidth: WIDTH,
                maxHeight: HEIGHT,
            });
        });
    });

    describe('openConstantsDialog', () => {
        it('should open constants dialog', () => {
            component.openConstantsDialog();
            expect(mockMatDialog.open).toHaveBeenCalledWith(ConstantsDialogComponent, {
                data: {},
                panelClass: 'custom-modalbox',
            });
        });
    });

    describe('openLoidingDialog', () => {
        it('should open loading dialog with initial player names', () => {
            component.playerNames = ['zied', 'skander'];
            component.openLoadingDialog();
            expect(mockMatDialog.open).toHaveBeenCalledWith(LoadingDialogComponent, {
                data: { playerNames: component.playerNames },
                panelClass: 'custom-modalbox',
            });
        });
    });

    describe('openGameOverDilog', () => {
        it('should open game over dialog when game is done', () => {
            const message = { message: 'game over ! ', isClassicGame: true };
            component.openGameOverDialog(message);
            expect(mockMatDialog.open).toHaveBeenCalledWith(GameOverDialogComponent, {
                data: message,
                panelClass: 'custom-modalbox',
            });
        });
    });

    describe('closeLoading', () => {
        it('should close the loading dialog', () => {
            component['loadingDialogRef'] = { close: jasmine.createSpy('close') } as unknown as MatDialogRef<LoadingDialogComponent>;
            component.closeLoadingDialog();
            expect(component['loadingDialogRef'].close).toHaveBeenCalled();
        });
    });

    describe('closeJoinLoadingDialog', () => {
        it('should close the Join Loading dialog', () => {
            component['joinLoadingDialogRef'] = { close: jasmine.createSpy('close') } as unknown as MatDialogRef<JoinLoadingDialogComponent>;
            component.closeJoinLoadingDialog();
            expect(component['joinLoadingDialogRef'].close).toHaveBeenCalled();
        });
    });

  

   

    
    
});
