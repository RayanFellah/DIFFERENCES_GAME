import { TestBed } from '@angular/core/testing';
import { FileUploaderService } from './file-uploader.service';

describe('FileUploaderService', () => {
    let service: FileUploaderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FileUploaderService],
        });
        service = TestBed.inject(FileUploaderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set canvas image', () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        service.setCanvasImage(file, 'left');
        const canvasImageSources = service['canvasImageSources'].value;
        canvasImageSources.left.subscribe((res) => {
            expect(res).toEqual(file);
        });
    });

    it('should set canvas merge', () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        service.setCanvasMerge(file, 'right');
        const mergedCanvasSources = service['mergedCanvasSources'].value;
        mergedCanvasSources.right.subscribe((res) => {
            expect(res).toEqual(file);
        });
    });
});
