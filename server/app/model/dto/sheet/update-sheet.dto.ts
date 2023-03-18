import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSheetDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    topPlayer?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    topScore?: string;

    @ApiProperty()
    @IsString()
    _id: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    difficulty?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isJoinable?: boolean;
}
