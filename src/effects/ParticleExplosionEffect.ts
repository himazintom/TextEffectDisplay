import { BaseEffect } from '../core/BaseEffect';
import { effectConfig } from '../config/effectConfig';

export class ParticleExplosionEffect extends BaseEffect {
    private intervalId: number | null = null;
    private animFrameIds: number[] = [];

    protected onStart(): void {
        this.intervalId = window.setInterval(() => {
            const count = Math.random() > 0.5 ? 2 : 1;
            for (let i = 0; i < count; i++) {
                this.launchFirework();
            }
        }, 600);
    }

    private launchFirework() {
        if (!this.container) return;

        const startX = Math.random() * window.innerWidth;
        const targetY = Math.random() * (window.innerHeight * 0.7);
        const startY = window.innerHeight + 20;

        const palette = effectConfig.colors.palette;
        const color = palette[Math.floor(Math.random() * palette.length)];

        const rocket = document.createElement('div');
        rocket.className = 'firework-rocket';
        rocket.style.left = `${startX}px`;
        rocket.style.top = `${startY}px`;
        rocket.style.backgroundColor = color;
        rocket.style.boxShadow = `0 0 10px ${color}`;

        this.container.appendChild(rocket);

        let currentY = startY;
        const speed = 10 + Math.random() * 5;

        const animateRocket = () => {
            currentY -= speed;
            rocket.style.top = `${currentY}px`;

            if (currentY > targetY) {
                if (rocket.parentElement && this.state === 'running') {
                    const id = requestAnimationFrame(animateRocket);
                    this.animFrameIds.push(id);
                } else {
                    rocket.remove();
                }
            } else {
                rocket.remove();
                if (this.state === 'running') {
                    this.explode(startX, targetY, color);
                }
            }
        };
        const id = requestAnimationFrame(animateRocket);
        this.animFrameIds.push(id);
    }

    private explode(centerX: number, centerY: number, baseColor: string) {
        if (!this.container) return;

        const item = this.musicList[Math.floor(Math.random() * this.musicList.length)];
        const title = item.title;

        for (let i = 0; i < title.length; i++) {
            const char = title[i];
            const el = document.createElement('div');
            el.className = 'particle-char';
            el.textContent = char;
            el.style.color = baseColor;
            el.style.fontSize = `${Math.floor(Math.random() * 20) + 16}px`;
            el.style.left = `${centerX}px`;
            el.style.top = `${centerY}px`;

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openYoutubeSearch(title);
            });

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            let x = centerX;
            let y = centerY;
            let opacity = 1;

            this.container.appendChild(el);

            const updateParticle = () => {
                x += vx;
                y += vy;
                vy += 0.05;
                vx *= 0.96;
                opacity -= 0.008;

                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.opacity = opacity.toString();

                if (opacity > 0 && el.parentElement && this.state === 'running') {
                    const id = requestAnimationFrame(updateParticle);
                    this.animFrameIds.push(id);
                } else {
                    el.remove();
                }
            };
            const id = requestAnimationFrame(updateParticle);
            this.animFrameIds.push(id);
        }
    }

    protected onUpdate(_deltaTime: number): void {
        // Handled by custom loops
    }

    protected onStop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
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
