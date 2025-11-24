import { BaseEffect } from '../core/BaseEffect';


export class RecordPlayerClassicEffect extends BaseEffect {
    private containerEl: HTMLDivElement | null = null;
    private discEl: HTMLDivElement | null = null;
    private rotation: number = 0;

    protected onStart(): void {
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'record-classic-container';

        // Vinyl Disc
        this.discEl = document.createElement('div');
        this.discEl.className = 'vinyl-disc';

        const label = document.createElement('div');
        label.className = 'vinyl-label';
        this.discEl.appendChild(label);

        this.containerEl.appendChild(this.discEl);

        // Tonearm (Visual only)
        const tonearm = document.createElement('div');
        tonearm.className = 'tonearm';
        this.containerEl.appendChild(tonearm);

        // Tracks
        this.createTracks();

        this.container.appendChild(this.containerEl);
    }

    private createTracks() {
        if (!this.discEl) return;

        const START_RADIUS = 180;
        const RING_SPACING = 40;
        const MAX_ITEMS = 60;

        let currentRadius = START_RADIUS;
        let itemCount = 0;
        const shuffledList = [...this.musicList].sort(() => Math.random() - 0.5);

        while (itemCount < MAX_ITEMS) {
            const circumference = 2 * Math.PI * currentRadius;
            const itemsInRing = Math.floor(circumference / 120); // Denser text

            if (itemsInRing <= 0) break;

            for (let i = 0; i < itemsInRing; i++) {
                if (itemCount >= MAX_ITEMS) break;

                const item = shuffledList[itemCount % shuffledList.length];
                const el = document.createElement('div');
                el.className = 'classic-track';
                el.textContent = item.title;

                const angle = (i / itemsInRing) * Math.PI * 2;
                const x = Math.cos(angle) * currentRadius;
                const y = Math.sin(angle) * currentRadius;

                // Position relative to center
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

    protected onUpdate(deltaTime: number): void {
        if (!this.discEl) return;
        this.rotation += 0.005; // Standard RPM
        this.discEl.style.transform = `rotate(${this.rotation}rad)`;
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
