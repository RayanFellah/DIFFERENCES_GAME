import { generateRandomId } from '@app/services/randomID/random-id';
import { Injectable } from '@nestjs/common';
import { createWriteStream, promises } from 'fs';
import * as path from 'path';
import { ImageDto } from './interfaces/image.dto';

@Injectable()
export class ImageStorageService {
    dataPath: string = './app/image-processing/imagesproc/data/images.json';
    uploadPath: string = './app/image-processing/imagesproc/uploads/';

    async getAllImages() {
        console.log('inii');
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
            const imagePath = path.join(__dirname.replace('/out', '').replace('/server-nestjs', ''), 'uploads', filename);
            const imageStream = createWriteStream(imagePath);
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
            throw new Error('could not read the file');
        }
    }

    async getImagePath(sheetId: string, isOriginal: boolean) {
        for (const img of await this.getAllImages()) {
            console.log(img.sheetId === sheetId);

            if (isOriginal === img.original && img.sheetId === sheetId) {
                return img.path;
            }
        }
        console.log('out');
        return undefined;
    }

    async deleteImage(id: string): Promise<void> {
        const image = await this.findImageById(id);
        let images = await this.readFromJsonFile();
        images = images.filter((img) => {
            if (img === image) {
                return img;
            }
        });

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
        console.log(fileData);
        return fileData;
    }

    private async writeToJsonFile(images: ImageDto[]): Promise<void> {
        await promises.writeFile(this.dataPath, JSON.stringify(images));
    }

    private async addImage(image: ImageDto): Promise<void> {
        try {
            const images = await this.readFromJsonFile();
            images.push(image);
            await this.writeToJsonFile(images);
        } catch (error) {
            throw new Error('cant add this item');
        }
    }
}
