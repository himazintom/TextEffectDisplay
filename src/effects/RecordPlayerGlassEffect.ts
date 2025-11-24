import { BaseEffect } from '../core/BaseEffect';

export class RecordPlayerGlassEffect extends BaseEffect {
    private containerEl: HTMLDivElement | null = null;
    private discEl: HTMLDivElement | null = null;
    private rotation: number = 0;

    protected onStart(): void {
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'record-glass-container';

        // Glass Disc
        this.discEl = document.createElement('div');
        this.discEl.className = 'glass-disc';

        // Inner glass hole
        const hole = document.createElement('div');
        hole.className = 'glass-hole';
        this.discEl.appendChild(hole);

        this.containerEl.appendChild(this.discEl);
        this.createTracks();
        this.container.appendChild(this.containerEl);
    }

    private createTracks() {
        if (!this.discEl) return;

        const START_RADIUS = 180;
        const RING_SPACING = 50;
        const MAX_ITEMS = 50;

        let currentRadius = START_RADIUS;
        let itemCount = 0;
        const shuffledList = [...this.musicList].sort(() => Math.random() - 0.5);

        while (itemCount < MAX_ITEMS) {
            const circumference = 2 * Math.PI * currentRadius;
            const itemsInRing = Math.floor(circumference / 140);

            for (let i = 0; i < itemsInRing; i++) {
                if (itemCount >= MAX_ITEMS) break;

                const item = shuffledList[itemCount % shuffledList.length];
                const el = document.createElement('div');
                el.className = 'glass-track';
                el.textContent = item.title;

                const angle = (i / itemsInRing) * Math.PI * 2;
                const x = Math.cos(angle) * currentRadius;
                const y = Math.sin(angle) * currentRadius;

                el.style.left = `50%`;
                el.style.top = `50%`;
                el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle + Math.PI / 2}rad)`;

                el.addEventListener('click', () => this.openYoutubeSearch(item.title));
                this.discEl.appendChild(el);
                itemCount++;
            }
            currentRadius += RING_SPACING;
        }
    }

    protected onUpdate(_deltaTime: number): void {
        if (!this.discEl) return;
        this.rotation += 0.003;

        // 3D tilt effect
        this.discEl.style.transform = `perspective(1000px) rotateX(20deg) rotateZ(${this.rotation}rad)`;
    }

    protected onStop(): void {
        this.containerEl?.remove();
        this.containerEl = null;
        this.discEl = null;
    }

    private openYoutubeSearch(query: string) {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
}
