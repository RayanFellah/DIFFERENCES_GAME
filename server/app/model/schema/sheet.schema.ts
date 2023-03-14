import { ApiProperty } from '@nestjs/swagger';

export class Sheet {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    originalImagePath: string;

    @ApiProperty()
    modifiedImagePath: string;

    @ApiProperty()
    difficulty: string;

    @ApiProperty()
    radius: number;

    @ApiProperty()
    topPlayer: string;

    @ApiProperty()
    differences: number;

    @ApiProperty()
    isJoinable: boolean;
}
