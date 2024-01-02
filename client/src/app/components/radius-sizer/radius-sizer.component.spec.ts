import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RadiusSizerComponent } from './radius-sizer.component';

describe('RadiusSizerComponent', () => {
    let component: RadiusSizerComponent;
    let fixture: ComponentFixture<RadiusSizerComponent>;
    let onChangeMock: jasmine.Spy;
    let onTouchMock: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [RadiusSizerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RadiusSizerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        onChangeMock = jasmine.createSpy('onChange');
        onTouchMock = jasmine.createSpy('onTouch');
        component.registerOnChange(onChangeMock);
        component.registerOnTouched(onTouchMock);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should increment the size by 3px when inc() is called and size is not 3 or 15', () => {
        const size = 9;
        spyOn(component.sizeChange, 'emit');
        component.size = 6;
        component.inc();
        expect(component.size).toEqual(size);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(size);
    });

    it('should increment the size by 6px when inc() is called and size is 3', () => {
        const size = 9;
        spyOn(component.sizeChange, 'emit');
        component.size = 3;
        component.inc();
        expect(component.size).toEqual(size);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(size);
    });

    it('should not increment the size when inc() is called and size is 15', () => {
        const size = 15;

        spyOn(component.sizeChange, 'emit');
        component.size = 15;
        component.inc();
        expect(component.size).toEqual(size);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(size);
    });

    it('should decrement the size by 6px when dec() is called and size is not 9 or 0', () => {
        const expectedSize = 6;
        spyOn(component.sizeChange, 'emit');
        component.size = 12;
        component.dec();
        expect(component.size).toEqual(expectedSize);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(expectedSize);
    });

    it('should decrement the size by 6px when dec() is called and size is 9', () => {
        spyOn(component.sizeChange, 'emit');
        component.size = 9;
        component.dec();
        expect(component.size).toEqual(3);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(3);
    });

    it('should not decrement the size when dec() is called and size is 0', () => {
        spyOn(component.sizeChange, 'emit');
        component.size = 0;
        component.dec();
        expect(component.size).toEqual(0);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(0);
    });

    it('should set the size to the input value in writeValue()', () => {
        const size = 10;
        component.writeValue(size);
        expect(component.size).toEqual(size);
    });

    it('should call the onChange function in resize()', () => {
        const size1 = 5;
        const size2 = 6;
        const size3 = 11;
        component.writeValue(size1);
        const onChangeSpy = jasmine.createSpy('onChange');
        component.registerOnChange(onChangeSpy);
        spyOn(component.sizeChange, 'emit');
        component.resize(size2);
        expect(onChangeSpy).toHaveBeenCalledWith(size3);
        expect(component.sizeChange.emit).toHaveBeenCalledWith(size3);
    });

    it('should call the onTouch function in resize()', () => {
        const size = 6;
        component.resize(size);
        expect(onTouchMock).toHaveBeenCalled();
    });

    it('should register the onChange function', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const onChangeFn = () => {};
        component.registerOnChange(onChangeFn);
        expect(component.onChange).toEqual(onChangeFn);
    });

    it('should register the onTouch function', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const onTouchFn = () => {};
        component.registerOnTouched(onTouchFn);
        expect(component.onTouch).toEqual(onTouchFn);
    });
});
