/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GameEvents {
    type: 'chat' | 'found' | 'error' | 'cheat' | 'hint' | 'lastHint';
    timestamp: number;
    data: any;
}
