import { Component, EventEmitter, ExistingProvider, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FIFTEEN, NINE, SIX } from 'src/constants';

const RADIUS_SIZER_VALUE_ACCESSOR: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadiusSizerComponent),
    multi: true,
};

@Component({
    selector: 'app-radius-sizer',
    templateUrl: './radius-sizer.component.html',
    styleUrls: ['./radius-sizer.component.scss'],
    providers: [RADIUS_SIZER_VALUE_ACCESSOR],
})
export class RadiusSizerComponent implements ControlValueAccessor {
    @Input() size: number | string;
    @Output() sizeChange = new EventEmitter<number>();

    onChange: (value: number) => void;
    onTouch: () => void;

    dec() {
        if (this.size === NINE) this.resize(-SIX);
        else this.resize(-SIX);
    }
    inc() {
        if (this.size === 3) this.resize(+SIX);
        else this.resize(+3);
    }

    resize(delta: number) {
        this.size = Math.min(FIFTEEN, Math.max(0, +this.size + delta));
        this.sizeChange.emit(this.size);
        if (this.onChange) {
            this.onChange(this.size);
        }
        if (this.onTouch) {
            this.onTouch();
        }
    }
    writeValue(value: number): void {
        this.size = value;
    }

    registerOnChange(onChange: (value: number) => void): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouch: () => void): void {
        this.onTouch = onTouch;
    }
}
