/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    private socket: Socket;
    private eventsSubject: Subject<any> = new Subject();

    constructor() {
        this.connect();
    }
    get socketId() {
        return this.socket.id;
    }
    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        if (!this.isSocketAlive()) {
            this.socket = io(environment.socketServerUrl, { transports: ['websocket'], upgrade: false });
            this.socket.onAny((event, ...args) => this.eventsSubject.next({ event, args }));
        }
    }

    disconnect() {
        if (this.isSocketAlive()) {
            this.socket.disconnect();
        }
    }

    on<T>(event: string): Observable<T> {
        return this.eventsSubject.asObservable().pipe(
            filter((e: any) => e.event === event),
            map((e: any) => e.args[0] as T),
        );
    }

    send<T>(event: string, data?: T) {
        if (data) this.socket.emit(event, data);
        else this.socket.emit(event);
    }
}
