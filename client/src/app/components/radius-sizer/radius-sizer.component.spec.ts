// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { RadiusSizerComponent } from './radius-sizer.component';

// describe('RadiusSizerComponent', () => {
//   let component: RadiusSizerComponent;
//   let fixture: ComponentFixture<RadiusSizerComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [FormsModule],
//       declarations: [RadiusSizerComponent],
//     }).compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(RadiusSizerComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should increment the size by 6px when inc() is called and size is not 3 or 15', () => {
//     spyOn(component.sizeChange, 'emit');
//     component.size = 6;
//     component.inc();
//     expect(component.size).toEqual(12);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(12);
//   });

//   it('should increment the size by 3px when inc() is called and size is 3', () => {
//     spyOn(component.sizeChange, 'emit');
//     component.size = 3;
//     component.inc();
//     expect(component.size).toEqual(6);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(6);
//   });

//   it('should not increment the size when inc() is called and size is 15', () => {
//     spyOn(component.sizeChange, 'emit');
//     component.size = 15;
//     component.inc();
//     expect(component.size).toEqual(15);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(15);
//   });

//   it('should decrement the size by 6px when dec() is called and size is not 9 or 0', () => {
//     spyOn(component.sizeChange, 'emit');
//     component.size = 12;
//     component.dec();
//     expect(component.size).toEqual(6);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(6);
//   });

//   it('should decrement the size by 6px when dec() is called and size is 9', () => {
//     spyOn(component.sizeChange, 'emit');
//     component.size = 9;
//     component.dec();
//     expect(component.size).toEqual(3);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(3);
//   });

//   it('should not decrement the size when dec() is called and size is 0', () => {
//     spyOn(component.sizeChange, 'emit');
//     component.size = 0;
//     component.dec();
//     expect(component.size).toEqual(0);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(0);
//   });

//   it('should set the size to the input value in writeValue()', () => {
//     component.writeValue(10);
//     expect(component.size).toEqual(10);
//   });

//   it('should call the onChange function in resize()', () => {
//     spyOn(component, 'onChange');
//     component.resize(1);
//     expect(component.sizeChange.emit).toHaveBeenCalledWith(Number(component.size));
//   });

//   it('should call the onTouch function in resize()', () => {
//     spyOn(component, 'onTouch');
//     component.resize(1);
//     expect(component.onTouch).toHaveBeenCalled();
//   });

//   it('should register the onChange function', () => {
//     const onChangeFn = () => {};
//     component.registerOnChange(onChangeFn);
//     expect(component.onChange).toEqual(onChangeFn);
//   });

//   it('should register the onTouch function', () => {
//     const onTouchFn = () => {};
//     component.registerOnTouched(onTouchFn);
//     expect(component.onTouch).toEqual(onTouchFn);
//   });
// });