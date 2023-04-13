import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { ChatZoneComponent } from './components/chat-zone/chat-zone.component';
import { ConfigButtonsComponent } from './components/config-buttons/config-buttons.component';
import { ConstantsDialogComponent } from './components/constants-dialog/constants-dialog.component';
import { DialogComponent } from './components/dialogue/dialog.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { GameCardGridComponent } from './components/game-card-grid/game-card-grid.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameOverDialogComponent } from './components/game-over-dialog/game-over-dialog.component';
import { GameScoreComponent } from './components/game-score/game-score.component';
import { HeaderComponent } from './components/header/header.component';
import { ImageAreaComponent } from './components/image-area/image-area.component';
import { ImageDialogComponent } from './components/image-dialog/image-dialog.component';
import { JoinLimitedTimeComponent } from './components/join-limited-time/join-limited-time.component';
import { JoinLoadingDialogComponent } from './components/join-loading-dialog/join-loading-dialog.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';
import { RadiusSizerComponent } from './components/radius-sizer/radius-sizer.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { FileValueAccessorDirective } from './directives/file-value-accessor.directive';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { CreationPageComponent } from './pages/creation-page/creation-page.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
import { CanvasHelperService } from './services/canvas-helper.service';
import { EventService } from './services/event-service.service';
import { HintDialogueComponent } from './components/hint-dialogue/hint-dialogue.component';
import { LimitedTimeGamePageComponent } from './pages/limited-time-game-page/limited-time-game-page.component';
import { TimeLimitPlayGroundComponent } from './components/time-limit-play-ground/time-limit-play-ground.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        SelectionPageComponent,
        GameCardGridComponent,
        HeaderComponent,
        ConfigurationPageComponent,
        ImageAreaComponent,
        CreationPageComponent,
        FileUploadComponent,
        RadiusSizerComponent,
        FileValueAccessorDirective,
        DialogComponent,
        ImageDialogComponent,
        DrawingComponent,
        ChatZoneComponent,
        ConfigButtonsComponent,
        ConstantsDialogComponent,
        LoadingDialogComponent,
        GameCardComponent,
        GameScoreComponent,
        JoinLoadingDialogComponent,
        GameOverDialogComponent,
        SideNavComponent,
        JoinLimitedTimeComponent,
        HintDialogueComponent,
        LimitedTimeGamePageComponent,
        TimeLimitPlayGroundComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatDialogModule,
        MatSliderModule,
        MatProgressSpinnerModule,
        IonicStorageModule.forRoot(),
        MatProgressBarModule,
        MatSidenavModule,
        MatDividerModule,
    ],
    providers: [
        { provide: Storage, useFactory: () => new Storage({}) },
        { provide: 'EventService', useClass: EventService },
        {
            provide: MatDialogRef,
            useValue: {},
        },
        CanvasHelperService,
        { provide: HTMLCanvasElement, useValue: document.createElement('canvas') },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
