// Core Types
export interface MusicItem {
    title: string;
    update: string;
}

export interface TreeNode {
    name: string;
    type: 'directory' | 'file';
    children?: TreeNode[] | null;
}

// Effect Configuration
export interface EffectConfig {
    maxItems?: number;
    speed?: number;
    colors?: readonly string[];
    physics?: PhysicsConfig;
    [key: string]: any;
}

export interface PhysicsConfig {
    gravity?: number;
    friction?: number;
    bounce?: number;
}

// Effect Item
export interface EffectItem {
    element: HTMLElement;
    data: MusicItem;
    position: { x: number; y: number };
    velocity?: { x: number; y: number };
    rotation?: number;
    scale?: number;
    opacity?: number;
    [key: string]: any;
}

// Effect Metadata
export interface EffectMetadata {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: 'easy' | 'medium' | 'hard';
    performanceImpact: 'low' | 'medium' | 'high';
}
