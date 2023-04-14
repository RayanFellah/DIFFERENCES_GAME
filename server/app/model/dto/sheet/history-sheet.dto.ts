import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class HistorySheetDto {
    @ApiProperty()
    @IsString()
    gameStart: string;

    @ApiProperty()
    @IsString()
    duration: string;

    @ApiProperty()
    @IsString()
    gameMode: string;

    @ApiProperty()
    player1: string;

    @ApiProperty()
    @IsBoolean()
    winner1: boolean;

    @ApiProperty()
    @IsBoolean()
    gaveUp1: boolean;

    @ApiProperty()
    @IsOptional()
    player2?: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    winner2?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    gaveUp2?: boolean;
}
