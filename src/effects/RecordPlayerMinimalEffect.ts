import { BaseEffect } from '../core/BaseEffect';
import type { MusicItem } from '../types';

export class RecordPlayerMinimalEffect extends BaseEffect {
    private containerEl: HTMLDivElement | null = null;
    private rotation: number = 0;
    private intervals: number[] = [];

    protected onStart(): void {
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'record-minimal-container';

        // Central geometric element
        const center = document.createElement('div');
        center.className = 'minimal-center';
        this.containerEl.appendChild(center);

        this.createTracks();
        this.container.appendChild(this.containerEl);
    }

    private createTracks() {
        if (!this.containerEl) return;

        const START_RADIUS = 150;
        const RING_SPACING = 80;
        const MAX_ITEMS = 40;

        let currentRadius = START_RADIUS;
        let itemCount = 0;
        const shuffledList = [...this.musicList].sort(() => Math.random() - 0.5);

        while (itemCount < MAX_ITEMS) {
            const circumference = 2 * Math.PI * currentRadius;
            const itemsInRing = Math.floor(circumference / 200);

            // Add a thin orbit line
            const orbit = document.createElement('div');
            orbit.className = 'minimal-orbit';
            orbit.style.width = `${currentRadius * 2}px`;
            orbit.style.height = `${currentRadius * 2}px`;
            this.containerEl.appendChild(orbit);

            for (let i = 0; i < itemsInRing; i++) {
                if (itemCount >= MAX_ITEMS) break;

                const item = shuffledList[itemCount % shuffledList.length];
                const el = document.createElement('div');
                el.className = 'minimal-track';
                el.textContent = item.title.toLowerCase();

                const angle = (i / itemsInRing) * Math.PI * 2;
                el.dataset.angle = angle.toString();
                el.dataset.radius = currentRadius.toString();
                el.dataset.title = item.title; // Store original title for search

                this.updateItemPosition(el, angle, currentRadius);

                el.addEventListener('click', () => {
                    // Use current title from textContent or dataset
                    const currentTitle = el.dataset.title || el.textContent || '';
                    this.openYoutubeSearch(currentTitle);
                });

                this.containerEl.appendChild(el);

                // Setup blinking and changing logic
                this.setupBlinkAndChange(el);

                itemCount++;
            }
            currentRadius += RING_SPACING;
        }
    }

    private setupBlinkAndChange(el: HTMLElement) {
        // Random interval between 5s and 15s
        const intervalTime = Math.random() * 10000 + 5000;

        const intervalId = window.setInterval(() => {
            // 1. Blink / Fade out
            el.style.transition = 'opacity 1s ease';
            el.style.opacity = '0';

            // 2. Change content after fade out completes
            setTimeout(() => {
                if (!el.parentElement) return;

                const newItem = this.musicList[Math.floor(Math.random() * this.musicList.length)];
                el.textContent = newItem.title.toLowerCase();
                el.dataset.title = newItem.title;

                // 3. Fade in slowly
                // Wait a tiny bit to ensure DOM update is registered
                requestAnimationFrame(() => {
                    el.style.opacity = '1';
                });

            }, 1000); // Match transition duration

        }, intervalTime);

        this.intervals.push(intervalId);
    }

    private updateItemPosition(el: HTMLElement, angle: number, radius: number) {
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        el.style.left = `50%`;
        el.style.top = `50%`;
        // Minimal: Text stays horizontal
        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    protected onUpdate(deltaTime: number): void {
        if (!this.containerEl) return;
        this.rotation += 0.001;

        const items = this.containerEl.getElementsByClassName('minimal-track');
        for (let i = 0; i < items.length; i++) {
            const item = items[i] as HTMLElement;
            const originalAngle = parseFloat(item.dataset.angle || '0');
            const radius = parseFloat(item.dataset.radius || '0');
            const currentAngle = originalAngle + this.rotation;

            this.updateItemPosition(item, currentAngle, radius);
        }
    }

    protected onStop(): void {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
        this.containerEl?.remove();
        this.containerEl = null;
    }

    private openYoutubeSearch(query: string) {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
}
