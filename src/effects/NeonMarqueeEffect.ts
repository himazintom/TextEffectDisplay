import { BaseEffect } from '../core/BaseEffect';
import { effectConfig } from '../config/effectConfig';

export class NeonMarqueeEffect extends BaseEffect {
    private animFrameIds: number[] = [];

    protected onStart(): void {
        const container = this.container;
        const musicList = this.musicList;

        const LANE_HEIGHT = 40;
        const LANES = Math.ceil(window.innerHeight / LANE_HEIGHT) + 2;

        for (let lane = 0; lane < LANES; lane++) {
            const laneEl = document.createElement('div');
            laneEl.className = 'marquee-lane';
            laneEl.style.top = `${lane * LANE_HEIGHT}px`;
            laneEl.style.height = `${LANE_HEIGHT}px`;

            const direction = lane % 2 === 0 ? -1 : 1;
            // Slower speed: 0.2 to 0.6
            const speed = (Math.random() * 0.4 + 0.2) * direction;

            let contentWidth = 0;

            while (contentWidth < window.innerWidth * 2) {
                const item = musicList[Math.floor(Math.random() * musicList.length)];
                const el = document.createElement('span');
                el.className = 'marquee-item';
                el.textContent = item.title;

                // Use effectConfig.colors.palette
                const palette = effectConfig.colors.palette;
                el.style.color = palette[Math.floor(Math.random() * palette.length)];
                el.style.fontSize = `${Math.floor(Math.random() * 10) + 14}px`;

                el.addEventListener('click', () => this.openYoutubeSearch(item.title));

                laneEl.appendChild(el);
                contentWidth += item.title.length * 10 + 30;
            }

            container.appendChild(laneEl);

            let currentPos = direction === 1 ? -window.innerWidth : 0;

            const update = () => {
                currentPos += speed;

                if (direction === -1 && currentPos < -window.innerWidth) {
                    currentPos = 0;
                } else if (direction === 1 && currentPos > 0) {
                    currentPos = -window.innerWidth;
                }

                laneEl.style.transform = `translateX(${currentPos}px)`;

                // Use this.animationFrameId for base loop, but here we have multiple loops?
                // BaseEffect manages one loop. If we have custom loops, we should manage them.
                // Or better, hook into onUpdate.
                // But this effect has per-lane animation.
                // Let's keep custom loop but push ID to array.

                // Check if running
                if (this.state === 'running') {
                    const id = requestAnimationFrame(update);
                    this.animFrameIds.push(id);
                }
            };

            const id = requestAnimationFrame(update);
            this.animFrameIds.push(id);
        }
    }

    protected onUpdate(_deltaTime: number): void {
        // Not used because we have per-lane loops
    }

    protected onStop(): void {
        this.animFrameIds.forEach(id => cancelAnimationFrame(id));
        this.animFrameIds = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    private openYoutubeSearch(query: string) {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}
