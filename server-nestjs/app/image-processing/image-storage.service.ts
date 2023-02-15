import { generateRandomId } from '@app/services/randomID/random-id';
import { Injectable } from '@nestjs/common';
import { createWriteStream, promises } from 'fs';
import { ImageDto } from './imagesproc/interfaces/image.dto';

@Injectable()
export class ImageStorageService {
    dataPath: string = './app/image-processing/imagesproc/data/images.json';
    uploadPath: string = './app/image-processing/imagesproc/uploads/';

    async getAllImages() {
        return await this.readFromJsonFile();
    }

    async findImageById(id: string): Promise<ImageDto> | undefined {
        const images = await this.readFromJsonFile();
        return images.find((img) => img.id === id);
    }

    async updateImage(image: ImageDto): Promise<void> {
        let images = await this.readFromJsonFile();
        images = images.map((img) => {
            return img.id === image.id ? image : img;
        });
        await this.writeToJsonFile(images);
    }

    async uploadImage(image: Buffer, sheetToAdd: string, filename: string, isOriginal: boolean): Promise<ImageDto> {
        try {
            const imageName = `${filename}`;
            const imagePath = `${this.uploadPath}${imageName}`;
            const imageStream = createWriteStream(imagePath);
            if (!image) {
                throw new Error('Upload-Failed');
            }
            imageStream.write(image);
            imageStream.end();

            const imageDto: ImageDto = {
                id: generateRandomId(),
                name: imageName,
                sheetId: sheetToAdd,
                path: imagePath,
                original: isOriginal,
            };
            await this.addImage(imageDto);

            return imageDto;
        } catch (error) {
            return error;
        }
    }

    async getImagePath(sheetId: string, isOriginal: boolean) {
        for (const img of await this.getAllImages()) {
            if (img.sheetId === sheetId && img.original === isOriginal) {
                return img.name;
            }
        }
        return undefined;
    }

    async deleteImage(id: string): Promise<void> {
        const image = await this.findImageById(id);
        let images = await this.readFromJsonFile();
        images = images.filter((img) => img.id !== id);

        await this.writeToJsonFile(images);
    }

    async getSheetId(id: string): Promise<string> {
        return (await this.findImageById(id)).sheetId;
    }

    async getImagePathFromId(id: string): Promise<string> {
        return (await this.findImageById(id)).path;
    }

    private async readFromJsonFile(): Promise<ImageDto[]> {
        const fileData = await promises.readFile(this.dataPath, 'utf-8').then((res) => JSON.parse(res));
        return fileData;
    }

    private async writeToJsonFile(images: ImageDto[]): Promise<void> {
        await promises.writeFile(this.dataPath, JSON.stringify(images));
    }

    private async addImage(image: ImageDto): Promise<void> {
        try {
            const images = await this.readFromJsonFile();
            if (!images) throw new Error('cant add item');
            images.push(image);
            await this.writeToJsonFile(images);
        } catch (error) {
            return error;
        }
    }
}
