import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintDialogueComponent } from './hint-dialogue.component';

describe('HintDialogueComponent', () => {
  let component: HintDialogueComponent;
  let fixture: ComponentFixture<HintDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HintDialogueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HintDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
