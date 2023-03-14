import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventService } from '@app/services/event-service.service';

import { ChatZoneComponent } from './chat-zone.component';

describe('ChatZoneComponent', () => {
    let component: ChatZoneComponent;
    let fixture: ComponentFixture<ChatZoneComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatZoneComponent],
            providers: [EventService],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatZoneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
