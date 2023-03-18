import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
    let component: FileUploadComponent;
    let fixture: ComponentFixture<FileUploadComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, MatSnackBarModule],
            declarations: [FileUploadComponent],
            providers: [{ provide: HTMLCanvasElement, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FileUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should not set file when onFileChange is called and image is invalid', () => {
        spyOn(component, 'onChange');
        spyOn(component['bmpVerificationService'], 'verifyImage').and.returnValue(false);
        spyOn(component['snackBar'], 'openSnackBar');
        const input = fixture.debugElement.nativeElement.querySelector('input[type="file"]');
        input.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(component.file).toBeUndefined();
        expect(component.fileName).toBeUndefined();
        expect(component.onChange).not.toHaveBeenCalled();
    });

    it('should reset file when onRemoveFile is called', () => {
        const mockFile = new File([''], 'filename');
        component.file = mockFile;
        component.fileName = 'filename';
        spyOn(component, 'onChange');
        component.onRemoveFile();
        expect(component.file).toBeNull();
        expect(component.fileName).toEqual('');
        expect(component.onChange).toHaveBeenCalled();
    });

    it('should call onTouched when markAsTouched is called', () => {
        spyOn(component, 'onTouched');
        component.markAsTouched();
        expect(component.touched).toBeTruthy();
        expect(component.onTouched).toHaveBeenCalled();
    });

    it('should set disabled state when setDisabledState is called', () => {
        component.setDisabledState(true);
        expect(component.disabled).toBeTruthy();
        component.setDisabledState(false);
        expect(component.disabled).toBeFalsy();
    });

    it('should call registerOnChange when registerOnChange is called', () => {
        const mockOnChange = jasmine.createSpy('mockOnChange');
        component.registerOnChange(mockOnChange);
        expect(component.onChange).toEqual(mockOnChange);
    });

    it('should call registerOnTouched when registerOnTouched is called', () => {
        const mockOnTouched = jasmine.createSpy('mockOnTouched');
        component.registerOnTouched(mockOnTouched);
        expect(component.onTouched).toEqual(mockOnTouched);
    });

    it('should write value when writeValue is called with file', () => {
        const mockFile = new File([''], 'filename');
        component.writeValue(mockFile);
        expect(component.file).toEqual(mockFile);
        expect(component.fileName).toEqual('filename');
    });
});
