import { Injectable } from '@nestjs/common';
import { createWriteStream, promises, createReadStream, readFileSync } from 'fs';
import { generateRandomId } from '@app/services/randomID/random-id';
import { ImageDto } from './interfaces/image.dto';
import { Express } from 'express';
import { SheetService } from '@app/model/database/Sheets/sheet.service';

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

    async uploadImage(image: Buffer, sheetToAdd: string, filename: string): Promise<void> {
        try {
            const imageName = `${filename}.bmp`;
            const imagePath = `${this.uploadPath}${imageName}`;
            const imageStream = createWriteStream(imagePath);
            imageStream.write(image);
            imageStream.end();

            const imageDto: ImageDto = {
                id: generateRandomId(),
                name: imageName,
                sheetId: sheetToAdd,
                path: imagePath,
            };
            await this.addImage(imageDto);
        } catch (error) {
            throw new Error('could not read the file');
        }
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
        return fileData;
    }

    private async writeToJsonFile(images: ImageDto[]): Promise<void> {
        await promises.writeFile(this.dataPath, JSON.stringify(images)).catch((err) => console.error(err));
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
