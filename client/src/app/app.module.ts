import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { DialogComponent } from './components/dialogue/dialog.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { GameCardGridComponent } from './components/game-card-grid/game-card-grid.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { HeaderComponent } from './components/header/header.component';
import { ImageAreaComponent } from './components/image-area/image-area.component';
import { RadiusSizerComponent } from './components/radius-sizer/radius-sizer.component';
import { FileValueAccessorDirective } from './directives/file-value-accessor.directive';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { CreationPageComponent } from './pages/creation-page/creation-page.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
import { ImageDialogComponent } from './components/image-dialog/image-dialog.component';

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
        GameCardComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
