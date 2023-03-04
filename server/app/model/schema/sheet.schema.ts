import { ApiProperty } from '@nestjs/swagger';

export class Sheet {
    @ApiProperty()
    id?: number;

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
}
