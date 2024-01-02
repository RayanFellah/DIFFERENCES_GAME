import { Score } from '@common/score';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSheetDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    top3Solo?: Score[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    top3Multi?: Score[];

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
