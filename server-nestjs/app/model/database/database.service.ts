import { GameSheet } from '@app/interfaces/GameSheet';
import 'dotenv/config';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
// import { Service } from 'typedi';

const COLLECTION_NAME = 'gameSheets';
const DATABASE_NAME = 'Database';
@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;
    private URL: string = 'mongodb+srv://Rayan:Project-DB@cluster0.enmzwny.mongodb.net/?retryWrites=true&w=majority';
    populateDb(collectionName: string, data: GameSheet[]) {
        const collection = this.db.collection(collectionName);
        collection.insertMany(data, (err, res) => {
            console.log('Documents were successfully loaded');
        });
    }

    async start(): Promise<void> {
        console.log('HERE!!');

        try {
            console.log('ici');
            this.client = new MongoClient(this.URL);
            await this.client.connect();
            this.db = this.client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    addGameSheet(gameSheet: GameSheet) {
        this.db.collection(COLLECTION_NAME).insertOne(gameSheet);
    }

    async getGameSheets() {
        const db = this.client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);
        const images = await collection.find({}).toArray();
        return images;
    }

    async getGameSheetById(id: number) {
        const db = this.client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);
        const image = await collection.findOne({ _id: id });
        return image;
    }

    get database(): Db {
        return this.db;
    }
}
