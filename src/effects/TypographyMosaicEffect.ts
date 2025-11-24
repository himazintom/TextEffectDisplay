import { BaseEffect } from '../core/BaseEffect';
import { effectConfig } from '../config/effectConfig';
import type { MusicItem } from '../types';

interface TileData {
    el: HTMLDivElement;
    textEl: HTMLDivElement;
    bars: HTMLDivElement[];
    x: number;
    y: number;
    color: string;
    title: string;
}

export class TypographyMosaicEffect extends BaseEffect {
    private mosaicContainer: HTMLDivElement | null = null;
    private tiles: TileData[] = [];
    private intervals: number[] = [];

    private readonly DRIFT_SPEED_X = 0.5;
    private readonly DRIFT_SPEED_Y = 0.3;
    private readonly TILE_SIZE = 120;

    // Grid dimensions
    private gridWidth: number = 0;
    private gridHeight: number = 0;
    private minX: number = 0;
    private minY: number = 0;
    private maxX: number = 0;
    private maxY: number = 0;

    protected onStart(): void {
        this.mosaicContainer = document.createElement('div');
        this.mosaicContainer.className = 'mosaic-container';
        // Reset styles to be a simple container, not centered/transformed by CSS
        this.mosaicContainer.style.width = '100%';
        this.mosaicContainer.style.height = '100%';
        this.mosaicContainer.style.top = '0';
        this.mosaicContainer.style.left = '0';
        this.mosaicContainer.style.transform = 'none';
        this.mosaicContainer.style.margin = '0';
        this.mosaicContainer.style.display = 'block'; // Override flex

        this.container.appendChild(this.mosaicContainer);

        // Calculate grid size to cover screen + buffer
        const cols = Math.ceil(window.innerWidth / this.TILE_SIZE) + 4; // Extra buffer
        const rows = Math.ceil(window.innerHeight / this.TILE_SIZE) + 4;

        this.gridWidth = cols * this.TILE_SIZE;
        this.gridHeight = rows * this.TILE_SIZE;

        // Start drawing from slightly outside top-left
        this.minX = -this.TILE_SIZE * 2;
        this.minY = -this.TILE_SIZE * 2;
        this.maxX = this.minX + this.gridWidth;
        this.maxY = this.minY + this.gridHeight;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.createTile(
                    this.minX + col * this.TILE_SIZE,
                    this.minY + row * this.TILE_SIZE
                );
            }
        }
    }

    private createTile(x: number, y: number) {
        if (!this.mosaicContainer) return;

        const item = this.getRandomMusicItem();
        const el = document.createElement('div');
        el.className = 'mosaic-tile';
        el.style.width = `${this.TILE_SIZE}px`;
        el.style.height = `${this.TILE_SIZE}px`;
        // Absolute positioning for manual control
        el.style.position = 'absolute';
        el.style.left = '0';
        el.style.top = '0';

        const palette = effectConfig.colors.palette;
        const color = palette[Math.floor(Math.random() * palette.length)];
        el.style.color = color;

        const textEl = document.createElement('div');
        textEl.className = 'mosaic-text';
        textEl.textContent = item.title;
        textEl.style.fontSize = `${Math.floor(Math.random() * 6) + 10}px`;
        el.appendChild(textEl);

        const spectrumEl = document.createElement('div');
        spectrumEl.className = 'mini-spectrum';
        const bars = [];
        for (let b = 0; b < 5; b++) {
            const bar = document.createElement('div');
            bar.className = 'mini-bar';
            bar.style.height = `${Math.random() * 100}%`;
            spectrumEl.appendChild(bar);
            bars.push(bar);
        }
        el.appendChild(spectrumEl);

        this.mosaicContainer.appendChild(el);

        const tileData: TileData = {
            el,
            textEl,
            bars,
            x,
            y,
            color,
            title: item.title
        };

        // Initial position
        el.style.transform = `translate(${x}px, ${y}px)`;

        this.tiles.push(tileData);

        // Click handler
        el.addEventListener('click', () => {
            // Use current title from data, as it might have changed
            this.openYoutubeSearch(tileData.title);
        });

        // Random glitch effect interval
        const intervalId = window.setInterval(() => {
            if (Math.random() < 0.05) { // Low chance
                this.glitchTile(tileData);
            }
        }, Math.random() * 5000 + 3000);
        this.intervals.push(intervalId);
    }

    private getRandomMusicItem(): MusicItem {
        return this.musicList[Math.floor(Math.random() * this.musicList.length)];
    }

    private glitchTile(tile: TileData) {
        if (!tile.el.parentElement) return;

        tile.el.style.opacity = '0.5';
        tile.el.style.transform = `translate(${tile.x + (Math.random() * 10 - 5)}px, ${tile.y + (Math.random() * 10 - 5)}px) scale(0.95)`;

        setTimeout(() => {
            if (!tile.el.parentElement) return;
            tile.el.style.opacity = '1';
            tile.el.style.transform = `translate(${tile.x}px, ${tile.y}px)`;
        }, 100);
    }

    private updateTileContent(tile: TileData) {
        const newItem = this.getRandomMusicItem();
        const palette = effectConfig.colors.palette;
        const newColor = palette[Math.floor(Math.random() * palette.length)];

        tile.title = newItem.title;
        tile.textEl.textContent = newItem.title;
        tile.color = newColor;
        tile.el.style.color = newColor;

        // Randomize font size slightly
        tile.textEl.style.fontSize = `${Math.floor(Math.random() * 6) + 10}px`;
    }

    protected onUpdate(deltaTime: number): void {
        if (!this.mosaicContainer) return;

        this.tiles.forEach(tile => {
            // Move
            tile.x -= this.DRIFT_SPEED_X;
            tile.y -= this.DRIFT_SPEED_Y;

            let wrapped = false;

            // Check bounds and wrap
            // If it goes too far left
            if (tile.x < this.minX - this.TILE_SIZE) {
                tile.x += this.gridWidth;
                wrapped = true;
            }
            // If it goes too far up
            if (tile.y < this.minY - this.TILE_SIZE) {
                tile.y += this.gridHeight;
                wrapped = true;
            }

            // If wrapped, update content to a new song!
            if (wrapped) {
                this.updateTileContent(tile);
            }

            // Apply transform
            tile.el.style.transform = `translate(${tile.x}px, ${tile.y}px)`;

            // Animate bars occasionally
            if (Math.random() > 0.95) {
                tile.bars.forEach(bar => {
                    bar.style.height = `${Math.random() * 100}%`;
                });
            }
        });
    }

    protected onStop(): void {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
        if (this.mosaicContainer) {
            this.mosaicContainer.remove();
            this.mosaicContainer = null;
        }
        this.tiles = [];
    }

    private openYoutubeSearch(query: string) {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}
