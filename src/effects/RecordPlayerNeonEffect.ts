import { BaseEffect } from '../core/BaseEffect';
import type { MusicItem } from '../types';

export class RecordPlayerNeonEffect extends BaseEffect {
    private containerEl: HTMLDivElement | null = null;
    private rotation: number = 0;


    protected onStart(): void {
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'record-neon-container';

        this.containerEl.style.transformOrigin = 'left center';

        // Event Delegation
        this.containerEl.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('neon-track') && target.dataset.title) {
                this.openYoutubeSearch(target.dataset.title);
            }
        });

        // Neon Rings
        for (let i = 1; i <= 4; i++) {
            const ring = document.createElement('div');
            ring.className = `neon-ring ring-${i}`;
            ring.style.left = '0';
            ring.style.top = '50%';
            ring.style.transform = 'translate(-50%, -50%)';
            this.containerEl.appendChild(ring);
        }



        this.createTracks();
        this.container.appendChild(this.containerEl);
    }

    private getNextMusicItem(): MusicItem {
        return this.getRandomMusicItem();
    }

    protected getRandomColor(): string {
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0099', '#00ff99', '#ff3333', '#33ff33'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private createTracks() {
        if (!this.containerEl) return;

        const LAYERS = 6;
        const MIN_RADIUS = 150;
        const MAX_RADIUS = window.innerWidth * 0.95;
        const RADIUS_STEP = (MAX_RADIUS - MIN_RADIUS) / LAYERS;

        const MIN_ANGLE_DEG = -80;
        const MAX_ANGLE_DEG = 80;
        const ANGLE_RANGE = (MAX_ANGLE_DEG - MIN_ANGLE_DEG) * (Math.PI / 180);
        const MIN_ANGLE_RAD = MIN_ANGLE_DEG * (Math.PI / 180);

        for (let layer = 0; layer < LAYERS; layer++) {
            const currentRadius = MIN_RADIUS + (layer * RADIUS_STEP);
            const arcLength = currentRadius * ANGLE_RANGE;
            const itemHeight = 25;
            const itemsInLayer = Math.floor(arcLength / itemHeight * 0.5);

            for (let i = 0; i < itemsInLayer; i++) {
                const item = this.getNextMusicItem();
                const el = document.createElement('div');
                el.className = 'neon-track';

                this.updateElementContent(el, item);

                const angleStep = ANGLE_RANGE / itemsInLayer;
                const angle = MIN_ANGLE_RAD + (i * angleStep) + (angleStep / 2);

                const radiusVariation = (Math.random() - 0.5) * (RADIUS_STEP * 0.3);
                const finalRadius = currentRadius + radiusVariation;

                el.dataset.angle = angle.toString();
                el.dataset.radius = finalRadius.toString();

                // Speed varies by layer
                const baseSpeed = 0.0003;
                const layerSpeedMod = (layer + 1) * 0.0001;
                el.dataset.speed = (baseSpeed + layerSpeedMod + (Math.random() * 0.0002)).toString();

                this.updateItemPosition(el, angle, finalRadius);

                el.style.transformOrigin = 'left center';
                el.style.textAlign = 'left';

                this.containerEl.appendChild(el);
            }
        }
    }

    private updateElementContent(el: HTMLElement, item: MusicItem) {
        el.textContent = item.title;
        el.dataset.title = item.title;

        const color = this.getRandomColor();
        el.style.color = color;
        el.style.textShadow = `0 0 5px ${color}, 0 0 10px ${color}`;
    }

    private updateItemPosition(el: HTMLElement, angle: number, radius: number) {
        const centerX = 0;
        const centerY = window.innerHeight / 2;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = `translate(0, -50%) rotate(${angle}rad)`;
    }

    protected onUpdate(_deltaTime: number): void {
        if (!this.containerEl) return;

        this.rotation += 0.0005;

        const items = this.containerEl.getElementsByClassName('neon-track');

        // Define visible range and fade range
        const MAX_DEG = 80;
        const FADE_DEG = 15; // Fade over 15 degrees at edges

        const MAX_ANGLE = MAX_DEG * (Math.PI / 180);
        const MIN_ANGLE = -MAX_DEG * (Math.PI / 180);

        // Thresholds for fading
        const FADE_START_MAX = (MAX_DEG - FADE_DEG) * (Math.PI / 180);
        const FADE_START_MIN = -(MAX_DEG - FADE_DEG) * (Math.PI / 180);

        for (let i = 0; i < items.length; i++) {
            const item = items[i] as HTMLElement;
            let angle = parseFloat(item.dataset.angle || '0');
            const radius = parseFloat(item.dataset.radius || '0');
            const speed = parseFloat(item.dataset.speed || '0.001');

            // Drift
            angle += speed;

            // Wrap logic:
            // Allow it to go slightly past MAX_ANGLE to ensure it's fully invisible before wrapping
            const WRAP_THRESHOLD = MAX_ANGLE + 0.2; // Extra buffer
            const RESET_POS = MIN_ANGLE - 0.2;      // Reset to slightly before start

            if (angle > WRAP_THRESHOLD) {
                angle = RESET_POS;

                // Update content while invisible
                const newMusicItem = this.getNextMusicItem();
                this.updateElementContent(item, newMusicItem);
            }

            // Opacity Calculation for smooth fade in/out
            let opacity = 1;
            if (angle > FADE_START_MAX) {
                // Fading out at bottom
                const progress = (angle - FADE_START_MAX) / (MAX_ANGLE - FADE_START_MAX);
                // Clamp progress 0-1, then invert
                opacity = 1 - Math.max(0, Math.min(1, progress));
            } else if (angle < FADE_START_MIN) {
                // Fading in at top
                const progress = (FADE_START_MIN - angle) / (FADE_START_MIN - MIN_ANGLE);
                opacity = 1 - Math.max(0, Math.min(1, progress));
            }

            // Force opacity to 0 if outside visible bounds (in the buffer zones)
            if (angle > MAX_ANGLE || angle < MIN_ANGLE) {
                opacity = 0;
            }

            item.style.opacity = opacity.toFixed(2);

            this.updateItemPosition(item, angle, radius);
            item.dataset.angle = angle.toString();
        }

        const rings = this.containerEl.getElementsByClassName('neon-ring');
        for (let i = 0; i < rings.length; i++) {
            const ring = rings[i] as HTMLElement;
            ring.style.left = '0px';
            ring.style.top = '50%';
            ring.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(Date.now() * 0.001 + i) * 0.05})`;
        }
    }

    protected onStop(): void {
        this.containerEl?.remove();
        this.containerEl = null;
    }

    private openYoutubeSearch(query: string) {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
}
