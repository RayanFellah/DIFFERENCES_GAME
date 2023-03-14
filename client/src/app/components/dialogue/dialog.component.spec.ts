import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { HEIGHT, WIDTH } from 'src/constants';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
    let component: DialogComponent;
    let fixture: ComponentFixture<DialogComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockMatDialog: any;

    beforeEach(async () => {
        mockMatDialog = {
            open: jasmine.createSpy('open'),
        };

        await TestBed.configureTestingModule({
            declarations: [DialogComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
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
});
