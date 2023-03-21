import { TestBed } from '@angular/core/testing';
import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('socket attribute should be defined on connection', () => {
        service.connect();
        expect(service.socket).toBeTruthy();
    });

    // it('socket attribute should be undefined on disconnection', () => {
    //     service.connect();
    //     service.disconnect();
    //     expect(service.socket).toBeFalsy();
    // });

    // it('should call socket.emit with event and data', () => {
    //     const socketSpy = jasmine.createSpyObj('Socket', ['emit']);
    //     const event = 'test';
    //     const data = { message: 'hello' };
    //     service.send(event, data);
    //     expect(socketSpy.emit).toHaveBeenCalledWith(event, data);
    // });

    // it('should call socket.emit with event only', () => {
    //     const socketSpy = jasmine.createSpyObj('Socket', ['emit']) as Socket;
    //     const event = 'test';
    //     service.send(event);
    //     expect(socketSpy.emit).toHaveBeenCalledWith(event);
    // });
});
