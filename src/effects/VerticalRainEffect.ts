import { BaseEffect } from '../core/BaseEffect';
import { effectConfig } from '../config/effectConfig';

export class VerticalRainEffect extends BaseEffect {
    private rainContainer: HTMLDivElement | null = null;
    private columnWidth: number = 35;
    private lastItemInColumn: (HTMLElement | null)[] = [];
    private columnTailY: number[] = [];

    protected onStart(): void {
        this.rainContainer = document.createElement('div');
        this.rainContainer.className = 'vertical-rain-container';
        this.container.appendChild(this.rainContainer);

        this.initColumns();

        // Prewarm
        for (let i = 0; i < 50; i++) {
            this.attemptSpawn(true);
        }
    }

    private initColumns() {
        const numColumns = Math.ceil(window.innerWidth / this.columnWidth);
        this.lastItemInColumn = new Array(numColumns).fill(null);
        this.columnTailY = new Array(numColumns).fill(-2000);
    }

    private attemptSpawn(randomY: boolean = false) {
        if (!this.rainContainer) return;

        const numColumns = this.lastItemInColumn.length;
        const indices = Array.from({ length: numColumns }, (_, i) => i);
        // Shuffle
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        for (const colIndex of indices) {
            let isSafe = false;
            let maxSpeedForThisItem = 100; // Default high limit

            if (randomY) {
                isSafe = true;
            } else {
                const lastItem = this.lastItemInColumn[colIndex];
                if (!lastItem) {
                    isSafe = true;
                } else {
                    // Check tail position
                    // Reduced density: Larger gap (approx 3x spacing)
                    const gap = 300 + Math.random() * 100;
                    if (this.columnTailY[colIndex] > gap) {
                        isSafe = true;

                        // CRITICAL FIX: Prevent overlapping by limiting speed
                        // Get speed of the last item
                        const lastSpeed = parseFloat(lastItem.dataset.speed || '1');
                        // The new item must not be faster than the last item
                        // to prevent overtaking.
                        maxSpeedForThisItem = lastSpeed;

                        // If the last item is too slow and still near the top, 
                        // spawning a new one (even slower) might clog the column.
                        // But since we checked the gap, it should be visually okay.
                    }
                }
            }

            if (isSafe) {
                let startY = -800;
                if (randomY) {
                    startY = (Math.random() * window.innerHeight * 1.5) - 500;
                }

                this.spawnInColumn(colIndex, startY, maxSpeedForThisItem);
                return;
            }
        }
    }

    private spawnInColumn(colIndex: number, startY: number, maxSpeed: number) {
        if (!this.rainContainer) return;

        const item = this.musicList[Math.floor(Math.random() * this.musicList.length)];
        const el = document.createElement('div');
        el.className = 'vertical-rain-item';
        el.textContent = item.title;

        const x = colIndex * this.columnWidth + (this.columnWidth - 24) / 2;
        el.style.left = `${x}px`;
        el.style.top = `${startY}px`;

        // Determine speed
        // Base random speed range: 0.7 to 1.7
        let speed = 0.7 + Math.random() * 1.0;

        // Cap speed to prevent overtaking
        if (speed > maxSpeed) {
            speed = maxSpeed;
        }

        el.dataset.speed = speed.toString();
        el.dataset.col = colIndex.toString();

        const palette = effectConfig.colors.palette;
        el.style.color = palette[Math.floor(Math.random() * palette.length)];

        const fontSize = 14 + Math.random() * 4;
        el.style.fontSize = `${fontSize}px`;
        el.style.opacity = (0.7 + Math.random() * 0.3).toString();

        this.rainContainer.appendChild(el);

        const height = el.offsetHeight;
        el.dataset.height = height.toString();

        if (startY === -800) {
            // Ensure it starts just above screen based on its actual height
            const adjustedY = -height - 50;
            el.style.top = `${adjustedY}px`;
            el.dataset.y = adjustedY.toString();

            this.lastItemInColumn[colIndex] = el;
            this.columnTailY[colIndex] = adjustedY + height;
        } else {
            el.dataset.y = startY.toString();
            this.lastItemInColumn[colIndex] = el;
            this.columnTailY[colIndex] = startY + height;
        }

        el.addEventListener('click', () => this.openYoutubeSearch(item.title));
    }

    protected onUpdate(deltaTime: number): void {
        if (!this.rainContainer) return;

        if (this.lastItemInColumn.length !== Math.ceil(window.innerWidth / this.columnWidth)) {
            this.initColumns();
        }

        // Reduced density: Single spawn attempt per frame
        this.attemptSpawn();

        const drops = this.rainContainer.getElementsByClassName('vertical-rain-item');
        const removeList: Element[] = [];

        for (let i = 0; i < drops.length; i++) {
            const drop = drops[i] as HTMLElement;
            let y = parseFloat(drop.dataset.y || '0');
            const speed = parseFloat(drop.dataset.speed || '1');
            const height = parseFloat(drop.dataset.height || '100');
            const col = parseInt(drop.dataset.col || '0');

            y += speed * (deltaTime * 0.1);

            if (y > window.innerHeight + 100) {
                removeList.push(drop);
                if (this.lastItemInColumn[col] === drop) {
                    this.lastItemInColumn[col] = null;
                    this.columnTailY[col] = -2000;
                }
            } else {
                drop.style.top = `${y}px`;
                drop.dataset.y = y.toString();

                if (this.lastItemInColumn[col] === drop) {
                    this.columnTailY[col] = y + height;
                }
            }
        }

        removeList.forEach(el => el.remove());
    }

    protected onStop(): void {
        this.rainContainer?.remove();
        this.rainContainer = null;
        this.lastItemInColumn = [];
        this.columnTailY = [];
    }

    private openYoutubeSearch(query: string) {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
}
