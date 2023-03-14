export interface Sheet {
    _id: string;
    title: string;
    originalImagePath: string;
    modifiedImagePath: string;
    difficulty: string;
    radius: number;
    topPlayer: string;
    differences: number;
    isJoinable: boolean;
}
