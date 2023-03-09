import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageDialogComponent } from './image-dialog.component';

describe('ImageDialogComponent', () => {
    let component: ImageDialogComponent;
    let fixture: ComponentFixture<ImageDialogComponent>;
    let domSanitizer: DomSanitizer;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageDialogComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { imageUrl: 'test-image-url' },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageDialogComponent);
        component = fixture.componentInstance;
        domSanitizer = TestBed.inject(DomSanitizer);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set imageUrl', () => {
        spyOn(domSanitizer, 'bypassSecurityTrustUrl');
        fixture.detectChanges();
        expect(domSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith('data:image/bmp;base64,test-image-url');
        expect(component.imageUrl).toBeDefined();
    });
});
