import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DrawingService } from '@app/services/draw.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SnackBarService } from '@app/services/snack-bar.service';

import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent],
            providers: [
                FormBuilder,
                { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 'test-id' } } } },
                { provide: SnackBarService, useValue: {} },
                { provide: SheetHttpService, useValue: {} },
                { provide: ImageHttpService, useValue: {} },
                { provide: Router, useValue: {} },
                { provide: MatDialog, useValue: {} },
                { provide: DrawingService, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    
});
