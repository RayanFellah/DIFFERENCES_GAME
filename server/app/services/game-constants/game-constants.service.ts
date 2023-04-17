import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
const fs = require('fs');

@Injectable()
export class GameConstantsService {
    data;
    file;

    readGameConstantsFile() {
        this.file = fs.readFileSync('assets/game-constants.json');
        this.data = JSON.parse(this.file);
        return this.data;
    }
    updateGameConstantsFile(data: GameConstants): void {
        this.data = data;
        fs.writeFileSync('assets/game-constants.json', JSON.stringify(this.data));
    }
}
