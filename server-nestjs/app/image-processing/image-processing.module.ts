import { Module } from '@nestjs/common';
import { ImagesController } from './imagesproc/images.controller';
import { ImageStorageService } from './imagesproc/image-storage.service';

@Module({
    controllers: [ImagesController],
    providers: [ImageStorageService],
})
export class ImageProcessingModule {}
