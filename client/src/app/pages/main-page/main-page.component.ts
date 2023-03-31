import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { Message } from '@common/message';
import { BehaviorSubject, map } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    providers: [DialogComponent],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(private readonly communicationService: CommunicationService, private readonly dialog: DialogComponent) {}

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.communicationService.basicPost(newTimeMessage).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }
    getMessagesFromServer(): void {
        this.communicationService
            .basicGet()
            // Cette étape transforme l'objet Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }

    selectGameMode() {
        const playerName = window.prompt('Entrez votre nom:');
        const validName = !(!playerName || playerName.trim().length === 0 || /^\d+$/.test(playerName));
        if (!validName) return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        this.dialog.openJoinLimitedTimeDialog();
    }

    joinTimeLimitSoloGame() {}

    joinCoopGame() {}
}
