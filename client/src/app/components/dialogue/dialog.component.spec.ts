import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { ConstantsDialogComponent } from '../constants-dialog/constants-dialog.component';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
    let component: DialogComponent;
    let fixture: ComponentFixture<DialogComponent>;
    let mockMatDialog: any;

    beforeEach(async () => {
        mockMatDialog = {
            open: jasmine.createSpy('open'),
        };

        await TestBed.configureTestingModule({
            declarations: [DialogComponent],
            providers: [{ provide: MatDialog, useValue: mockMatDialog }],
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
                maxWidth: jasmine.any(String),
                maxHeight: jasmine.any(String),
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
});
