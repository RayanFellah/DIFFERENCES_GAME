import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    const activatedRouteMock = {
        snapshot: {
            paramMap: {
                get: (param: string) => {
                    switch (param) {
                        case 'name':
                            return 'John Doe';
                        case 'id':
                            return '123';
                        case 'roomName':
                            return 'Room 1';
                        default:
                            return null;
                    }
                },
            },
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                { provide: ImageHttpService, useValue: {} },
                { provide: SheetHttpService, useValue: {} },
                { provide: CheatModeService, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
