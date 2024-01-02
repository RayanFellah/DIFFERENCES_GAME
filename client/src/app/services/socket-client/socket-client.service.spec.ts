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

    it('should have a valid socket server url', () => {
        expect(service['socket'].io['uri']).toBeDefined();
        expect(service['socket'].io['uri'].length).toBeGreaterThan(0);
    });

    it('should send a message to socket server', () => {
        const spy = spyOn(service['socket'], 'emit');
        service.send('test', 'test');
        expect(spy).toHaveBeenCalled();
    });
    it('should disconnect from socket server', () => {
        service.disconnect();
        expect(service.isSocketAlive()).toBeFalsy();
    });
});
