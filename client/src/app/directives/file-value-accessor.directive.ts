/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/directive-class-suffix */
/* eslint-disable @angular-eslint/directive-selector */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Directive, ElementRef, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: '[appFileInput]',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileValueAccessorDirective), multi: true }],
})
export class FileValueAccessorDirective implements ControlValueAccessor {
    fileInput: any;
    fileName = '';
    constructor(el: ElementRef) {
        this.fileInput = el;
    }
    @HostListener('change', ['$event.target.files']) onChange = (files: FileList) => {};
    @HostListener('blur') onTouched = () => {};

    writeValue(files: FileList) {}
    registerOnChange(fn: (files: FileList) => void) {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }
}
