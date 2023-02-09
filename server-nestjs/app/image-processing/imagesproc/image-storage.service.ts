import { generateRandomId } from '@app/services/randomID/random-id';
import { Injectable } from '@nestjs/common';
import { createWriteStream, promises } from 'fs';
import { ImageDto } from './interfaces/image.dto';

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

    async uploadImage(image: Buffer, sheetToAdd: string, filename: string): Promise<ImageDto> {
        console.log('uploadImage');
        try {
            const imageName = `${filename}`;
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
            return imageDto;
        } catch (error) {
            throw new Error('could not read the file');
        }
    }

    async sendImagesFromSheetId(sheetId: string) {
        const files = [];
        const images = await this.findImagePairs(sheetId);

        try {
            for (const img of images) {
                files.push(promises.readFile(img.path));
            }
            return files;
        } catch (error) {
            throw new Error('error while reading files from path');
        }
    }

    async findImagePairs(sheetId: string) {
        const pairOfPaths = [];

        const images = await this.getAllImages();

        // for (const img of images) {
        //     if (img.sheetId === sheetId) {
        //         if (img.original) {
        //             pairOfPaths.push({ original: img.path });
        //         } else {
        //             pairOfPaths.push({ modified: img.path });
        //         }
        //     }
        // }
        return pairOfPaths;
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
