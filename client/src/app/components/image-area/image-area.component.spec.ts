import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploaderService } from '@app/services/file-uploader.service';
import { of } from 'rxjs';

import { ImageAreaComponent } from './image-area.component';

describe('ImageAreaComponent', () => {
    let component: ImageAreaComponent;
    let fixture: ComponentFixture<ImageAreaComponent>;
    let fileUploaderServiceSpy: jasmine.SpyObj<FileUploaderService>;

    beforeEach(() => {
        fileUploaderServiceSpy = jasmine.createSpyObj('FileUploaderService', ['getCanvasImageSource']);
        fileUploaderServiceSpy.getCanvasImageSource.and.returnValue(of(new File([''], 'test.jpg')));
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageAreaComponent],
            providers: [{ provide: FileUploaderService, useValue: fileUploaderServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
