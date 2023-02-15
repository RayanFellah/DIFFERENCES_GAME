import { ApiProperty } from '@nestjs/swagger';
export class ImageDto {
    @ApiProperty({ required: false })
    id: string;

    @ApiProperty({ required: true })
    name: string;

    @ApiProperty({ required: true })
    sheetId: string;

    @ApiProperty()
    original: boolean;

    @ApiProperty({ required: false })
    path: string;
}
