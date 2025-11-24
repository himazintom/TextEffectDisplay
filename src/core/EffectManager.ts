/**
 * Effect Manager - Singleton Pattern
 * 
 * 設計根拠:
 * 1. Singleton: 複数のマネージャーインスタンス防止 → 競合状態の排除
 * 2. Factory Pattern: エフェクト生成を一元管理 → 一貫性保証
 * 3. エラーバウンダリー: エフェクト切り替え失敗時の安全性
 */

import { BaseEffect } from './BaseEffect';
import type { MusicItem, EffectConfig, EffectMetadata } from '../types';

export interface RegisteredEffect {
    metadata: EffectMetadata;
    EffectClass: new (
        container: HTMLElement,
        musicList: MusicItem[],
        config: EffectConfig
    ) => BaseEffect;
    defaultConfig: EffectConfig;
}

export class EffectManager {
    private static instance?: EffectManager;
    private currentEffect?: BaseEffect;
    private effects: Map<string, RegisteredEffect> = new Map();
    private container?: HTMLElement;
    private musicList: MusicItem[] = [];

    /**
     * Private constructor for Singleton
     * 根拠: 単一インスタンスを保証 → グローバル状態の管理を単純化
     */
    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): EffectManager {
        if (!EffectManager.instance) {
            EffectManager.instance = new EffectManager();
        }
        return EffectManager.instance;
    }

    /**
     * Initialize manager with container and music list
     * 根拠: 初期化を明示的に → 未初期化状態での使用を防ぐ
     */
    public initialize(container: HTMLElement, musicList: MusicItem[]): void {
        if (!container) {
            throw new Error('Container element is required');
        }
        if (!musicList || musicList.length === 0) {
            throw new Error('Music list cannot be empty');
        }

        this.container = container;
        this.musicList = [...musicList]; // Defensive copy
    }

    /**
     * Register an effect
     * 根拠: 型安全な登録、重複防止
     */
    public registerEffect(
        id: string,
        metadata: EffectMetadata,
        EffectClass: new (
            container: HTMLElement,
            musicList: MusicItem[],
            config: EffectConfig
        ) => BaseEffect,
        defaultConfig: EffectConfig = {}
    ): void {
        if (this.effects.has(id)) {
            console.warn(`Effect with id '${id}' already registered. Overwriting.`);
        }

        this.effects.set(id, {
            metadata,
            EffectClass,
            defaultConfig: Object.freeze({ ...defaultConfig })
        });
    }

    /**
     * Get all registered effects
     */
    public getRegisteredEffects(): EffectMetadata[] {
        return Array.from(this.effects.values()).map((effect) => effect.metadata);
    }

    /**
     * Switch to a new effect
     * 根拠: 
     * - 前のエフェクトを確実に停止 → メモリリーク防止
     * - エラー時のロールバック → 安全性
     * - 非同期エラーハンドリング → UI応答性維持
     */
    public async switchEffect(
        id: string,
        customConfig?: Partial<EffectConfig>
    ): Promise<void> {
        if (!this.container) {
            throw new Error('EffectManager not initialized');
        }

        const registeredEffect = this.effects.get(id);
        if (!registeredEffect) {
            throw new Error(`Effect with id '${id}' not found`);
        }

        try {
            // Stop current effect
            if (this.currentEffect) {
                console.log(`Stopping current effect: ${this.currentEffect.constructor.name}`);
                this.currentEffect.stop();
                this.currentEffect = undefined;
            }

            // Merge default and custom config
            const config: EffectConfig = {
                ...registeredEffect.defaultConfig,
                ...customConfig
            };

            // Create and start new effect
            console.log(`Starting new effect: ${id}`);
            this.currentEffect = new registeredEffect.EffectClass(
                this.container,
                this.musicList,
                config
            );

            this.currentEffect.start();
        } catch (error) {
            console.error(`Failed to switch to effect '${id}':`, error);

            // Cleanup on error
            if (this.currentEffect) {
                try {
                    this.currentEffect.stop();
                } catch (stopError) {
                    console.error('Error stopping failed effect:', stopError);
                }
                this.currentEffect = undefined;
            }

            throw error;
        }
    }

    /**
     * Switch to random effect
     * 根拠: ランダム選択をマネージャーに集約 → ロジックの一元化
     */
    public async switchToRandomEffect(): Promise<string> {
        const effectIds = Array.from(this.effects.keys());
        if (effectIds.length === 0) {
            throw new Error('No effects registered');
        }

        const randomIndex = Math.floor(Math.random() * effectIds.length);
        const randomId = effectIds[randomIndex];

        await this.switchEffect(randomId);
        return randomId;
    }

    /**
     * Get current effect state
     */
    public getCurrentEffectState(): string {
        return this.currentEffect?.getState() || 'none';
    }

    /**
     * Stop current effect
     */
    public stopCurrentEffect(): void {
        if (this.currentEffect) {
            this.currentEffect.stop();
            this.currentEffect = undefined;
        }
    }

    /**
     * Cleanup all resources
     * 根拠: アプリケーション終了時のクリーンアップ
     */
    public dispose(): void {
        this.stopCurrentEffect();
        this.effects.clear();
        this.container = undefined;
        this.musicList = [];
    }
}
