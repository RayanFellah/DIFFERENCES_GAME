import { Injectable } from '@nestjs/common';
import { createWriteStream, promises } from 'fs';
import { generateRandomId } from '@app/services/randomID/random-id';
import { ImageDto } from './interfaces/image.dto';

@Injectable()
export class ImageStorageService {
    dataPath: string = './images.json';

    async getAllImages() {
        await this.readFromJsonFile();
    }

    async findImageById(id: string): Promise<ImageDto> | undefined {
        const images = await this.readFromJsonFile();
        return images.find((img) => img.id === id);
    }

    async updateImage(id: string): Promise<void> {
        const image = await this.findImageById(id);
        let images = await this.readFromJsonFile();
        images = images.map((img) => {
            return img === image ? image : img;
        });
        await this.writeToJsonFile(images);
    }

    async uploadImage(image: Express.Multer.File, sheetToAdd: string): Promise<void> {
        const imageName = `${Date.now()}.bmp`;
        const imagePath = `./uploads/${imageName}`;
        const imageStream = createWriteStream(imagePath);
        imageStream.write(image);
        imageStream.end();

        // const imageDto: ImageDto = {
        //     id: generateRandomId(),
        //     name: imageName,
        //     sheetId: sheetToAdd,
        //     path: imagePath,
        // };

        // await this.addImage(imageDto);
    }

    async deleteImage(id: string): Promise<void> {
        const image = await this.findImageById(id);
        let images = await this.readFromJsonFile();
        images = images.filter((img) => {
            if (img !== image) {
                return img;
            }
        });

        await this.writeToJsonFile(images);
    }

    private async readFromJsonFile(): Promise<ImageDto[]> {
        try {
            const fileData = await promises.readFile(this.dataPath, 'utf-8');
            return JSON.parse(fileData);
        } catch (error) {
            throw new Error('cant read json file');
        }
    }

    private async writeToJsonFile(images: ImageDto[]): Promise<void> {
        await promises.writeFile(this.dataPath, JSON.stringify(images));
    }

    private async addImage(image: ImageDto): Promise<void> {
        try {
            const images = await this.readFromJsonFile();
            images.push(image);
        } catch (error) {
            throw new Error('cant add this item');
        }
    }
}
