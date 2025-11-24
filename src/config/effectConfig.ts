/**
 * Configuration Module
 * 
 * 設計根拠:
 * 1. 中央集約: すべての設定を1箇所で管理 → 変更時の影響範囲が明確
 * 2. 不変性(Immutable): Object.freeze で予期せぬ変更を防ぐ
 * 3. 型安全性: TypeScript で設定の型を保証
 * 4. デフォルト値: 安全なフォールバック
 */

import type { EffectConfig } from '../types';

/**
 * Deep freeze object - recursive immutability
 * 根拠: ネストしたオブジェクトも含めて完全に不変化
 */
function deepFreeze<T>(obj: T): Readonly<T> {
    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value = (obj as any)[prop];
        if (
            value !== null &&
            (typeof value === 'object' || typeof value === 'function') &&
            !Object.isFrozen(value)
        ) {
            deepFreeze(value);
        }
    });

    return obj;
}

/**
 * Global color palette
 * 根拠: 色の一貫性、エフェクト間での再利用
 */
export const COLORS = deepFreeze([
    '#00d2ff', // Cyan
    '#ff0055', // Pink  '#00ff9d', // Green
    '#ffd700', // Gold
    '#ffffff', // White
    '#ff8c00', // Orange
    '#bd00ff', // Purple
    '#ff1493', // Deep Pink
    '#00ffff', // Aqua
    '#ff69b4', // Hot Pink
    '#7fff00', // Chartreuse
    '#ff4500'  // Orange Red
] as const);

/**
 * Common physics settings
 * 根拠: 物理演算の一貫性
 */
export const PHYSICS = deepFreeze({
    gravity: 0.2,
    friction: 0.98,
    bounce: 0.8,
    maxVelocity: 10
} as const);

/**
 * Default effect configurations
 * 根拠: 安全なデフォルト値、エフェクトごとの最適パラメータ
 */
export const DEFAULT_EFFECT_CONFIGS = deepFreeze({
    spiralGalaxy: {
        maxItems: 30,
        speed: 0.02,
        radiusGrowth: 1.5,
        colors: COLORS,
        physics: undefined
    } as EffectConfig,

    waveSurfing: {
        maxItems: 20,
        lanes: 5,
        speed: 1.5,
        amplitude: 50,
        frequency: 0.005,
        colors: COLORS
    } as EffectConfig,

    particleExplosion: {
        maxItems: 50,
        speed: 3,
        colors: COLORS,
        physics: PHYSICS
    } as EffectConfig,

    typographyMosaic: {
        rows: 6,
        cols: 8,
        blinkInterval: 3000,
        colors: COLORS
    } as EffectConfig,

    audioSpectrum: {
        numBars: 20,
        updateInterval: 500,
        colors: COLORS
    } as EffectConfig,

    cubeRotation: {
        faces: 6,
        rotationInterval: 3000,
        colors: COLORS
    } as EffectConfig,

    neonMarquee: {
        lanes: 4,
        itemsPerLane: 10,
        speed: 30,
        colors: COLORS
    } as EffectConfig,

    dnaHelix: {
        numItems: 40,
        radius: 150,
        speed: 0.02,
        colors: COLORS
    } as EffectConfig,

    blackHoleWarp: {
        maxItems: 30,
        startDistance: 800,
        speed: 5,
        spawnInterval: 500,
        colors: COLORS
    } as EffectConfig,

    recordPlayer: {
        numItems: 20,
        radius: 300,
        rotationSpeed: 0.005,
        colors: COLORS
    } as EffectConfig
} as const);

/**
 * Font families
 * 根拠: タイポグラフィの一貫性
 */
export const FONTS = deepFreeze([
    "'Inter', sans-serif",
    "'Noto Sans JP', sans-serif",
    "'Orbitron', sans-serif",
    "serif",
    "monospace",
    "cursive"
] as const);

/**
 * Font size ranges (min, max)
 * 根拠: 視認性と美観のバランス
 */
export const FONT_SIZE_RANGE = deepFreeze({
    min: 16,
    max: 64
} as const);

/**
 * Performance settings
 * 根拠: デバイス性能に応じた調整
 */
export const PERFORMANCE = deepFreeze({
    maxFPS: 60,
    lowPowerMode: {
        maxFPS: 30,
        reducedParticles: true
    }
} as const);

/**
 * Get random font
 */
export function getRandomFont(): string {
    return FONTS[Math.floor(Math.random() * FONTS.length)];
}

/**
 * Get random font size
 */
export function getRandomFontSize(): number {
    return (
        Math.floor(Math.random() * (FONT_SIZE_RANGE.max - FONT_SIZE_RANGE.min)) +
        FONT_SIZE_RANGE.min
    );
}

/**
 * Get random color
 */
export function getRandomColor(): string {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const effectConfig = {
    colors: {
        palette: COLORS
    },
    fonts: {
        families: FONTS
    },
    physics: PHYSICS,
    defaults: DEFAULT_EFFECT_CONFIGS
};
