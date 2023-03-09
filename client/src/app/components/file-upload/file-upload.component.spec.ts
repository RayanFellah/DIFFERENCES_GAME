import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BmpVerificationService } from '@app/services/bmp-verification.service';
import { SnackBarService } from '@app/services/snack-bar.service';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
    let component: FileUploadComponent;
    let fixture: ComponentFixture<FileUploadComponent>;
    let bmpVerificationService: BmpVerificationService;
    let snackBarService: SnackBarService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FileUploadComponent],
            imports: [FormsModule, MatSnackBarModule],
            providers: [BmpVerificationService, SnackBarService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FileUploadComponent);
        component = fixture.componentInstance;
        bmpVerificationService = TestBed.inject(BmpVerificationService);
        snackBarService = TestBed.inject(SnackBarService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onChange function when a file is selected', () => {
        spyOn(component, 'onChange');
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const inputElement = fixture.nativeElement.querySelector('input[type="file"]');
        const event = new Event('change');
        inputElement.files = [file];
        inputElement.dispatchEvent(event);
        fixture.detectChanges();
        expect(component.onChange).toHaveBeenCalledWith(file);
    });

    it('should not call onChange function if file is not a valid BMP image', () => {
        spyOn(component, 'onChange');
        spyOn(bmpVerificationService, 'verifyImage').and.returnValue(false);
        spyOn(snackBarService, 'openSnackBar');
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const inputElement = fixture.nativeElement.querySelector('input[type="file"]');
        const event = new Event('change');
        inputElement.files = [file];
        inputElement.dispatchEvent(event);
        fixture.detectChanges();
        expect(component.onChange).not.toHaveBeenCalled();
        expect(snackBarService.openSnackBar).toHaveBeenCalled();
    });

    it('should clear file when remove button is clicked', () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        component.writeValue(file);
        fixture.detectChanges();
        const removeButton = fixture.nativeElement.querySelector('button');
        removeButton.click();
        fixture.detectChanges();
        expect(component.file).toBeNull();
        expect(component.fileName).toEqual('');
        expect(component.touched).toBeTruthy();
    });

    it('should be disabled when disabled is set to true', () => {
        component.setDisabledState(true);
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('input[type="file"]');
        expect(inputElement.disabled).toBeTruthy();
    });
});
