/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GameEvents {
    type: 'chat' | 'found' | 'error' | 'cheat';
    timestamp: number;
    data: any;
}
