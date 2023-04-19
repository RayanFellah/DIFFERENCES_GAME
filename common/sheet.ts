import { Score } from "./score";

export interface Sheet {
    _id: string;
    title: string;
    originalImagePath: string;
    modifiedImagePath: string;
    difficulty: string;
    radius: number;
    differences: number;
    isJoinable: boolean;
    top3Solo: Score[];
    top3Multi: Score[];
}
