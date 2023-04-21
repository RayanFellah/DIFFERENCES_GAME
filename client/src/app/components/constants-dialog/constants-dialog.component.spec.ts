import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ConstantsDialogComponent } from './constants-dialog.component';

describe('ConstantsDialogComponent', () => {
    let component: ConstantsDialogComponent;
    let fixture: ComponentFixture<ConstantsDialogComponent>;
    const socketServiceStub = {
        send: () => {
            return;
        },
        on: () => {
            return;
        },
    } as unknown as SocketClientService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConstantsDialogComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceStub },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConstantsDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the correct game time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const gameTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(1) span');
        expect(gameTimeElement.textContent).toContain('30 secondes');
    });

    it('should display the correct penalty time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const penaltyTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(2) span');
        expect(penaltyTimeElement.textContent.trim()).toBe('5 secondes');
    });

  
    it('should increment the game time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const incrementButton = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(1) button:nth-of-type(2)');
        incrementButton.click();
        fixture.detectChanges();
        const gameTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(1) span');
        expect(gameTimeElement.textContent).toContain('31 secondes');
    } );

    it('should decrement the game time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const decrementButton = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(1) button:nth-of-type(1)');
        decrementButton.click();
        fixture.detectChanges();
        const gameTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(1) span');
        expect(gameTimeElement.textContent).toContain('29 secondes');
    } );

    it('should increment the penalty time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const incrementButton = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(2) button:nth-of-type(2)');
        incrementButton.click();
        fixture.detectChanges();
        const penaltyTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(2) span');
        expect(penaltyTimeElement.textContent.trim()).toBe('6 secondes');
    } );

    it('should decrement the penalty time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const decrementButton = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(2) button:nth-of-type(1)');
        decrementButton.click();
        fixture.detectChanges();
        const penaltyTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(2) span');
        expect(penaltyTimeElement.textContent.trim()).toBe('4 secondes');
    } );

 
   

    

    

  

});
