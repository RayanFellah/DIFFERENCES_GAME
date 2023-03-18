// import { ChatGateway } from '@app/gateways/chat/chat.gateway';
// import { GameLogicService } from '@app/services/game-logic/game-logic.service';
// import { SheetService } from '@app/services/sheet/sheet.service';
// import { Logger } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
// import { BroadcastOperator, Server, Socket } from 'socket.io';
// import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
// import { ChatEvents } from './chat.gateway.events';

// describe('ChatGateway', () => {
//     let gateway: ChatGateway;
//     let logger: SinonStubbedInstance<Logger>;
//     let socket: SinonStubbedInstance<Socket>;
//     let server: SinonStubbedInstance<Server>;

//     beforeEach(async () => {
//         logger = createStubInstance(Logger);
//         socket = createStubInstance<Socket>(Socket);
//         server = createStubInstance<Server>(Server);
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 ChatGateway,
//                 {
//                     provide: Logger,
//                     useValue: logger,
//                 },
//                 SheetService,
//                 GameLogicService,
//             ],
//         }).compile();

//         gateway = module.get<ChatGateway>(ChatGateway);
//         // We want to assign a value to the private field
//         // eslint-disable-next-line dot-notation
//         gateway['server'] = server;
//     });

//     it('should be defined', () => {
//         expect(gateway).toBeDefined();
//     });

//     // it('broadcastAll() should send a mass message to the server', () => {
//     //     gateway.broadcastAll(socket, 'X');
//     //     expect(server.emit.calledWith(ChatEvents.MassMessage, match.any)).toBeTruthy();
//     // });

//     it('roomMessage() should not send message if socket not in the room', () => {
//         stub(socket, 'rooms').value(new Set());
//         gateway.roomMessage(socket, 'X');
//         expect(server.to.called).toBeFalsy();
//     });

//     it('roomMessage() should send message if socket in the room', () => {
//         stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
//         server.to.returns({
//             emit: (event: string) => {
//                 expect(event).toEqual(ChatEvents.RoomMessage);
//             },
//         } as BroadcastOperator<unknown, unknown>);
//         gateway.roomMessage(socket, 'X');
//     });

//     it('afterInit() should emit time after 1s', () => {
//         jest.useFakeTimers();
//         gateway.afterInit();
//         jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
//         expect(server.emit.calledWith(ChatEvents.Clock, match.any)).toBeTruthy();
//     });

//     it('hello message should be sent on connection', () => {
//         gateway.handleConnection(socket);
//         expect(socket.emit.calledWith(ChatEvents.Hello, match.any)).toBeTruthy();
//     });

//     it('socket disconnection should be logged', () => {
//         gateway.handleDisconnect(socket);
//         expect(logger.log.calledOnce).toBeTruthy();
//     });
// });
