import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class HistoryInterface {
    @ApiProperty()
    gameStart: string;

    @ApiProperty()
    duration: string;

    @ApiProperty()
    gameMode: string;

    @ApiProperty()
    player1: string;

    @ApiProperty()
    winner1: boolean;

    @ApiProperty()
    gaveUp1: boolean;

    @ApiProperty()
    @IsOptional()
    player2: string;

    @ApiProperty()
    @IsOptional()
    winner2: boolean;

    @ApiProperty()
    @IsOptional()
    gaveUp2: boolean;
}
