import { BaseEffect } from '../core/BaseEffect';
import { effectConfig } from '../config/effectConfig';

export class RecordPlayerEffect extends BaseEffect {
    private recordContainer: HTMLDivElement | null = null;
    private rotation: number = 0;
    // BaseEffect manages animationFrameId, but we can use our own if we override start/stop or use onUpdate properly.
    // BaseEffect calls onUpdate every frame. We should use that.

    protected onStart(): void {
        this.recordContainer = document.createElement('div');
        this.recordContainer.className = 'record-container';

        const START_RADIUS = 250;
        const RING_SPACING = 60;
        const MAX_RADIUS = window.innerWidth * 1.5;
        const MAX_ITEMS = 100;

        let currentRadius = START_RADIUS;
        let ringIndex = 0;
        let itemCount = 0;

        const shuffledList = [...this.musicList].sort(() => Math.random() - 0.5);

        while (currentRadius < MAX_RADIUS && itemCount < MAX_ITEMS) {
            const circumference = 2 * Math.PI * currentRadius;
            const itemSpacing = 500;
            const itemsInRing = Math.max(3, Math.floor(circumference / itemSpacing));

            for (let i = 0; i < itemsInRing; i++) {
                if (itemCount >= MAX_ITEMS) break;

                const item = shuffledList[itemCount % shuffledList.length];
                const el = document.createElement('div');
                el.className = 'record-item';
                el.textContent = item.title;

                const palette = effectConfig.colors.palette;
                el.style.color = palette[(ringIndex + i) % palette.length];
                el.style.fontSize = '14px';

                const angle = (i / itemsInRing) * Math.PI * 2;

                const x = Math.cos(angle) * currentRadius;
                const y = Math.sin(angle) * currentRadius;

                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.transform = `translate(-50%, -50%)`;

                this.recordContainer.appendChild(el);

                el.addEventListener('click', () => this.openYoutubeSearch(item.title));
                itemCount++;
            }

            currentRadius += RING_SPACING;
            ringIndex++;
        }

        this.container.appendChild(this.recordContainer);
    }

    protected onUpdate(_deltaTime: number): void {
        if (!this.recordContainer) return;

        this.rotation += 0.0005;
        this.recordContainer.style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad)`;

        const items = this.recordContainer.getElementsByClassName('record-item');
        for (let i = 0; i < items.length; i++) {
            const item = items[i] as HTMLElement;
            item.style.transform = `translate(-50%, -50%) rotate(${-this.rotation}rad)`;
        }
    }

    protected onStop(): void {
        if (this.recordContainer) {
            this.recordContainer.remove();
            this.recordContainer = null;
        }
    }

    private openYoutubeSearch(query: string) {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}
