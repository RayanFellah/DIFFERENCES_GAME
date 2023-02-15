import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-sizer',
    templateUrl: './sizer.component.html',
    styleUrls: ['./sizer.component.scss'],
})
export class SizerComponent {
    @Input() size: number | string;
    @Output() sizeChange = new EventEmitter<number>();

    dec() {
        if (this.size === 9) this.resize(-6);
        else this.resize(-3);
    }
    inc() {
        if (this.size === 3) this.resize(+6);
        else this.resize(+3);
    }

    resize(delta: number) {
        this.size = Math.min(15, Math.max(0, +this.size + delta));
        this.sizeChange.emit(this.size);
    }
}
