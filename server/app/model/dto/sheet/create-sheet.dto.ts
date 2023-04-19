import { Score } from '@common/score';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSheetDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    originalImagePath: string;

    @ApiProperty()
    modifiedImagePath: string;

    @ApiProperty()
    radius: number;

    @ApiProperty()
    differences: number;

    @ApiProperty()
    difficulty: string;

    @ApiProperty()
    isJoinable: boolean;

    @ApiProperty()
    top3Solo: Score[];

    @ApiProperty()
    top3Multi: Score[];
}
