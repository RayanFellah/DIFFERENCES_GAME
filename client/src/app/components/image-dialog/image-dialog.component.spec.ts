import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageDialogComponent } from './image-dialog.component';

describe('ImageDialogComponent', () => {
    let component: ImageDialogComponent;
    let fixture: ComponentFixture<ImageDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageDialogComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { imageUrl: 'test-image-url' },
                },
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageDialogComponent);
        component = fixture.componentInstance;
        TestBed.inject(DomSanitizer);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set imageUrl', () => {
        const imageUrl = 'test';
        const sanitizer = TestBed.inject(DomSanitizer);
        const spy = spyOn(sanitizer, 'bypassSecurityTrustUrl').and.returnValue('safeUrl');
        component = new ImageDialogComponent({ imageUrl }, sanitizer, {} as MatDialogRef<ImageDialogComponent>);
        expect(spy).toHaveBeenCalledWith('data:image/bmp;base64,test');
        expect(component.imageUrl).toEqual('safeUrl');
    });
});
