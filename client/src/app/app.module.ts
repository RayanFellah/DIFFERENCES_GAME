import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { GameCardsGridComponent } from './components/game-cards-grid/game-cards-grid.component';
import { GameScoreComponent } from './components/game-score/game-score.component';
import { HeaderComponent } from './components/header/header.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
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
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, MatGridListModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
