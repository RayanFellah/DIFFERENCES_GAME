import { Component, ExistingProvider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BmpVerificationService } from '@app/services/bmp-verification.service';
import { SnackBarService } from '@app/services/snack-bar.service';

const FILE_UPLOAD_VALUE_ACCESSOR: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileUploadComponent),
    multi: true,
};
@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    providers: [FILE_UPLOAD_VALUE_ACCESSOR],
})
export class FileUploadComponent implements ControlValueAccessor {
    file: File | null;
    fileName: string;

    touched: boolean = false;

    disabled: boolean = false;

    constructor(private readonly bmpVerificationService: BmpVerificationService, private readonly snackBar: SnackBarService) {}

    // eslint-disable-next-line no-unused-vars
    onChange = (_file: File | null) => {
        // Placeholder for the real function
    };
    onTouched = () => {
        // Placeholder for the real function
    };

    onFileChange(event: Event) {
        this.markAsTouched();
        if (!this.disabled) {
            const target = event.target as HTMLInputElement;
            if (target.files != null && target.files.length > 0) {
                const file = target.files[0];
                if (this.bmpVerificationService.verifyImage(file)) {
                    this.file = file;
                    this.fileName = file.name;
                    this.onChange(this.file);
                } else {
                    this.snackBar.openSnackBar("L'image n'est pas 640 x 480px ou de format 24-bit bmp.", 'Fermer');
                }
            }
        }
    }

    onRemoveFile() {
        this.markAsTouched();
        if (!this.disabled) {
            this.file = null;
            this.fileName = '';
            this.onChange(this.file);
        }
    }
    writeValue(file: File) {
        if (file) {
            this.file = file;
            this.fileName = file.name;
        }
    }

    registerOnChange(onChange: (file: File | null) => void) {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: () => void) {
        this.onTouched = onTouched;
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
    }
}
