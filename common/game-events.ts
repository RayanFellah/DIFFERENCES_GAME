export enum GameEvents {
    ClickTL = 'click_tl',
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
    Clock = 'clock',
    JoinedWaitingRoom = 'joinedWaitingRoom',
    SecondPlayerJoined = 'secondPlayerJoined',
    playerLeft = 'playerLeft',
    GameOver = 'gameOver',
    SheetDeleted = 'sheetDeleted',
    SheetCreated = 'sheetCreated',
    UpdateConstants = 'updateConstants',
    TimeOut = 'timeOut',
    CancelGame = 'cancelGame',
}

export const WAITING_ROOM = 'waitingRoom';
