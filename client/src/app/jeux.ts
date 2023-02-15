export interface Jeu {
    id: number;
    name: string;
    difficulty: string;
    bestSoloTimes: number[];
    best1v1Times: number[];
}
export const exJeux = [
    { name: 'jeu1', difficulty: 'easy', bestSoloTimes: [10, 20, 30], best1v1Times: [10, 20, 30] },
    { name: 'jeu2', difficulty: 'hard', bestSoloTimes: [10, 20, 30], best1v1Times: [10, 20, 30] },
    { name: 'jeu3', difficulty: 'medium', bestSoloTimes: [10, 20, 30], best1v1Times: [10, 20, 30] },
    { name: 'jeu4', difficulty: 'Veteran', bestSoloTimes: [10, 20, 30], best1v1Times: [10, 20, 30] },
    { name: 'jeu5', difficulty: 'Veteran', bestSoloTimes: [10, 20, 30], best1v1Times: [10, 20, 30] },
    { name: 'jeu6', difficulty: 'Veteran', bestSoloTimes: [10, 20, 30], best1v1Times: [10, 20, 30] },
];
