// import { StopWatch } from '@app/controllers/chronometer/stopwatch.component';
// import { PlayerHandler } from '@app/controllers/player/player.component';
// import { Injectable } from '@nestjs/common';
// import { Difference } from '../difference/difference.service';
// import { DifferenceDetector } from '../differences-detector/differences-detector.service';
// import { ImageService } from '../Image-service/Image.service';
// import { MouseHandlerService } from '../mouse-handler/mouse-handler.service';

// Injectable();
// export class GameLogicService {
//     differences: Difference[];
//     detector: DifferenceDetector;
//     enlargingRadius: number;
//     mouseService: MouseHandlerService;
//     differencesLeft: number = 7;
//     stopWatch: StopWatch;
//     player: PlayerHandler;

//     constructor(path1: String, path2: String, detector: DifferenceDetector, radius: number = 1, playername: string) {
//         this.player = new PlayerHandler(playername);
//         this.stopWatch = new StopWatch();
//         this.detector = detector;
//         this.detector.image1 = new ImageService(path1);
//         this.detector.image2 = new ImageService(path2);
//         this.mouseService = new MouseHandlerService();
//         this.enlargingRadius = radius;
//     }

//     async init() {
//         await this.detector.getAllClusters(this.enlargingRadius);
//         this.differences = this.detector.differences;
//         this.mouseService.differences = this.detector.differences;
//         this.stopWatch.start();
//     }

//     removeDifference(diff: Difference) {
//         this.differences = this.differences.filter((res) => res === diff);
//     }

//     isDone() {
//         if (this.differencesLeft === 0) {
//             this.stopWatch.stop();
//             console.log(`You finished the game in ${this.stopWatch.getTime()}`);
//             this.player.time = this.stopWatch.getTime();
//             return true;
//         }
//         return false;
//     }

//     handleClick(event: MouseEvent) {
//         if (!this.isDone()) {
//             const difference = this.mouseService.onMouseClick({ posX: event.offsetX, posY: event.offsetY });
//             if (difference) {
//                 console.log('User has found a difference');
//                 this.differencesLeft--;
//                 this.removeDifference(difference);
//                 return difference;
//             } else {
//                 console.log('Nope!');
//                 return undefined;
//             }
//         }
//         console.log('The game is done alerady !');
//     }
// }
