import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSheetDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    topPlayer?: string;

    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    difficulty?: string;
}
