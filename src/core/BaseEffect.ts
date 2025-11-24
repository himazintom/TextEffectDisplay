/**
 * Base Effect Abstract Class
 * 
 * 設計根拠:
 * 1. ライフサイクル管理: start/stop で確実なリソース管理
 * 2. 状態機械: 不正な状態遷移を防ぐ
 * 3. Template Method パターン: 共通処理を基底クラスに集約
 */

import type { MusicItem, EffectConfig, EffectItem } from './types';

export type EffectState = 'stopped' | 'starting' | 'running' | 'stopping';

export abstract class BaseEffect {
    protected container: HTMLElement;
    protected musicList: MusicItem[];
    protected config: Readonly<EffectConfig>;
    protected items: Set<EffectItem> = new Set();
    protected state: EffectState = 'stopped';
    protected animationFrameId?: number;
    protected lastUpdateTime: number = 0;

    constructor(
        container: HTMLElement,
        musicList: MusicItem[],
        config: EffectConfig
    ) {
        if (!container) {
            throw new Error('Container element is required');
        }
        if (!musicList || musicList.length === 0) {
            throw new Error('Music list cannot be empty');
        }

        this.container = container;
        this.musicList = [...musicList]; // Defensive copy
        this.config = Object.freeze({ ...config }); // Immutable
    }

    /**
     * Start the effect
     * 根拠: リソース確保を一元管理、状態チェックで競合防止
     */
    public start(): void {
        if (this.state !== 'stopped') {
            console.warn(`Effect already in state: ${this.state}`);
            return;
        }

        try {
            this.state = 'starting';
            this.onStart();
            this.state = 'running';
            this.lastUpdateTime = performance.now();

            // Handle visibility change
            document.addEventListener('visibilitychange', this.handleVisibilityChange);

            this.scheduleUpdate();
        } catch (error) {
            this.state = 'stopped';
            this.cleanup();
            throw new Error(`Failed to start effect: ${error}`);
        }
    }

    private handleVisibilityChange = () => {
        if (document.hidden) {
            // Tab is hidden, we can pause updates if we want, 
            // but crucially we must reset lastUpdateTime when we come back.
            // For now, let's just let the loop continue (browsers throttle RAF anyway),
            // but we need to ensure deltaTime doesn't explode.
        } else {
            // Tab is visible again
            // Reset lastUpdateTime so we don't get a huge jump
            this.lastUpdateTime = performance.now();
        }
    };

    /**
     * Stop the effect
     * 根拠: リソース解放を確実に実行、メモリリーク防止
     */
    public stop(): void {
        if (this.state === 'stopped') {
            return;
        }

        this.state = 'stopping';

        try {
            // Cancel animation frame
            if (this.animationFrameId !== undefined) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = undefined;
            }

            // Call derived class cleanup
            this.onStop();

            document.removeEventListener('visibilitychange', this.handleVisibilityChange);

            // Remove all DOM elements
            this.cleanup();

            this.state = 'stopped';
        } catch (error) {
            console.error('Error during effect stop:', error);
            // Force cleanup even on error
            this.forceCleanup();
            this.state = 'stopped';
        }
    }

    /**
     * Check if effect is running
     */
    public isRunning(): boolean {
        return this.state === 'running';
    }

    /**
     * Get current state
     */
    public getState(): EffectState {
        return this.state;
    }

    /**
     * Schedule next update
     * 根拠: requestAnimationFrame を一元管理
     */
    private scheduleUpdate(): void {
        if (this.state !== 'running') {
            return;
        }

        this.animationFrameId = requestAnimationFrame((currentTime) => {
            try {
                let deltaTime = currentTime - this.lastUpdateTime;

                // Cap deltaTime to prevent huge jumps (e.g. after tab switch)
                // 100ms = 10fps minimum. If lag is worse, we just slow down simulation.
                if (deltaTime > 100) deltaTime = 100;

                this.lastUpdateTime = currentTime;

                this.onUpdate(deltaTime);
                this.scheduleUpdate(); // Continue loop
            } catch (error) {
                console.error('Error in effect update:', error);
                this.stop(); // Stop on error
            }
        });
    }

    /**
     * Cleanup all resources
     * 根拠: DOM要素を確実に削除、メモリリーク防止
     */
    protected cleanup(): void {
        this.items.forEach((item) => {
            try {
                item.element?.remove();
            } catch (error) {
                console.error('Error removing element:', error);
            }
        });
        this.items.clear();
    }

    /**
     * Force cleanup (for error recovery)
     */
    private forceCleanup(): void {
        try {
            this.container.innerHTML = '';
            this.items.clear();
        } catch (error) {
            console.error('Force cleanup failed:', error);
        }
    }

    /**
     * Helper: Get random music item
     */
    protected getRandomMusicItem(): MusicItem {
        const index = Math.floor(Math.random() * this.musicList.length);
        return this.musicList[index];
    }

    /**
     * Helper: Get random color
     */
    protected getRandomColor(): string {
        const colors = this.config.colors || ['#ffffff'];
        const index = Math.floor(Math.random() * colors.length);
        return colors[index];
    }

    /**
     * Helper: Create DOM element with click handler
     */
    protected createElement(
        className: string,
        title: string,
        clickHandler: () => void
    ): HTMLElement {
        const el = document.createElement('div');
        el.className = className;
        el.textContent = title;
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clickHandler();
        });
        return el;
    }

    /**
     * Helper: Open YouTube search
     */
    protected openYouTubeSearch(query: string): void {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }

    // Abstract methods to be implemented by derived classes
    protected abstract onStart(): void;
    protected abstract onUpdate(deltaTime: number): void;
    protected abstract onStop(): void;
}
