import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatZoneComponent } from './chat-zone.component';

describe('ChatZoneComponent', () => {
  let component: ChatZoneComponent;
  let fixture: ComponentFixture<ChatZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatZoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
