import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ConfigButtonsComponent } from './components/config-buttons/config-buttons.component';
import { GameCardButtonsComponent } from './components/game-card-buttons/game-card-buttons.component';
import { GameCardsGridComponent } from './components/game-cards-grid/game-cards-grid.component';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { GameScoreComponent } from './components/game-score/game-score.component';
import { HeaderComponent } from './components/header/header.component';
import { ImageAreaComponent } from './components/image-area/image-area.component';
import { PlayAreaComponent } from './components/play-area/play-area.component';
import { TimerComponent } from './components/timer/timer.component';
import { DialogPalyerNameComponent } from './dialog-palyer-name/dialog-palyer-name.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
import { SizerComponent } from './components/sizer/sizer.component';
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
        HeaderComponent,
        SelectionPageComponent,
        GameCardsGridComponent,
        GamePageComponent,
        GameScoreComponent,
        ConfigurationPageComponent,
        ConfigButtonsComponent,
        GameConstantsComponent,
        ImageAreaComponent,
        GameCreationPageComponent,
        GameCardButtonsComponent,
        DialogPalyerNameComponent,
        ImageAreaComponent,
        GameCreationPageComponent,
        TimerComponent,
        SizerComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        ReactiveFormsModule,
    ],
    providers: [HTMLCanvasElement],
    bootstrap: [AppComponent],
})
export class AppModule {}
