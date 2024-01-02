import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { FileValueAccessorDirective } from './file-value-accessor.directive';

@Component({
    template: ' <input type="file" appFileInput [(ngModel)]="file" /> ',
})
class TestComponent {
    file: FileList;
}

describe('FileValueAccessorDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directiveEl: DebugElement;
    let directiveInstance: FileValueAccessorDirective;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [TestComponent, FileValueAccessorDirective],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Get a reference to the directive
        directiveEl = fixture.debugElement.query(By.directive(FileValueAccessorDirective));
        directiveInstance = directiveEl.injector.get(FileValueAccessorDirective);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onChange when file input changes', () => {
        const file = new File(['test'], 'test.txt');
        const fileList = {
            item: () => file,
            length: 1,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            0: file,
        } as FileList;
        const onChangeSpy = spyOn(directiveInstance, 'onChange');

        directiveEl.triggerEventHandler('change', { target: { files: fileList } });

        expect(onChangeSpy).toHaveBeenCalledWith(fileList);
    });
});
