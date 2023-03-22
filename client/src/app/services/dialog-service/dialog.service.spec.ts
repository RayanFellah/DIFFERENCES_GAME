import { DialogService } from './dialog.service';

describe('DialogService', () => {
    let service: DialogService;

    beforeEach(() => {
        service = new DialogService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit cancellation', () => {
        spyOn(service.playerName, 'next');
        spyOn(service.cancel, 'next');
        service.emitCancellation();
        expect(service.playerName.next).toHaveBeenCalledWith([]);
        expect(service.cancel.next).toHaveBeenCalledWith(true);
    });

    it('should emit join cancellation', () => {
        spyOn(service.cancelJoin, 'next');
        service.emitJoinCancellation();
        expect(service.cancelJoin.next).toHaveBeenCalledWith(true);
    });

    // it('should emit rejection', () => {
    //     const playerName = 'test player';
    //     service.emitPlayerNames(playerName);
    //     spyOn(service.playerName, 'getValue').and.returnValue([playerName]);
    //     spyOn(service.playerName, 'next');
    //     spyOn(service.playerRejected, 'next');
    //     service.emitRejection(playerName);
    //     expect(service.playerName.getValue()).not.toContain(playerName);
    //     expect(service.playerName.next).toHaveBeenCalledWith([]);
    //     expect(service.playerRejected.next).toHaveBeenCalledWith(playerName);
    // });

    it('should emit player names', () => {
        const playerName = 'test player';
        spyOn(service.playerName, 'getValue').and.returnValue([]);
        spyOn(service.playerName, 'next');
        service.emitPlayerNames(playerName);
        expect(service.playerName.getValue()).toContain(playerName);
        expect(service.playerName.next).toHaveBeenCalledWith([playerName]);
    });

    it('should emit confirmation', () => {
        const playerName = 'test player';
        spyOn(service.playerName, 'next');
        spyOn(service.playerConfirmed, 'next');
        service.emitConfirmation(playerName);
        expect(service.playerName.next).toHaveBeenCalledWith([]);
        expect(service.playerConfirmed.next).toHaveBeenCalledWith(playerName);
    });

    it('should reset all behaviors', () => {
        spyOn(service.cancel, 'next');
        spyOn(service.playerConfirmed, 'next');
        spyOn(service.playerRejected, 'next');
        spyOn(service.playerName, 'next');
        service.reset();
        expect(service.cancel.next).toHaveBeenCalledWith(false);
        expect(service.playerConfirmed.next).toHaveBeenCalledWith(null);
        expect(service.playerRejected.next).toHaveBeenCalledWith(null);
        expect(service.playerName.next).toHaveBeenCalledWith([]);
    });
});
