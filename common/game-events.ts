export enum GameEvents {
    Click = 'click',
    RequestImages = 'requestImages',
    ClickValidated = 'clickValidated',
    RequestSecondPlayer = 'requestSecondPlayer',
    CreateLimitedTimeSolo = 'createLimitedTimeSolo',
    LimitedTimeRoomCreated = 'limitedTimeRoomCreated',
    CreateLimitedTimeCoop = 'createLimitedTimeCoop',
    JoinCoop = 'joinCoop',
    CoopRoomCreated = 'coopRoomCreated',
    GetImages = 'getImagesFromSheet',
    ImagesServed = 'ImagesServed',
    Time = 'time',
    WaitingRoomCreated = 'waitingRoomCreated',
    CoopGameConfirmed = 'coopGameConfirmed',
    playerReady = 'playerReady',
}

export const WAITING_ROOM = 'waitingRoom';
