import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game/:playerName', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'creation', component: GameCreationPageComponent },
    { path: 'app-selection-page', component: SelectionPageComponent },
    { path: 'config', component: ConfigurationPageComponent },
    { path: '**', redirectTo: '/home' },
    { path: 'app-play-area', component: PlayAreaComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
