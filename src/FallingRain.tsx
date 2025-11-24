import React, { useEffect, useRef } from 'react';
import type { MusicItem } from './types';
import { effectConfig } from './config/effectConfig';

interface FallingRainProps {
    musicList: MusicItem[];
}

const FallingRain: React.FC<FallingRainProps> = ({ musicList }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animFrameIds = useRef<number[]>([]);
    const intervalIds = useRef<number[]>([]);

    useEffect(() => {
        if (!containerRef.current || musicList.length === 0) return;

        const container = containerRef.current;
        const MAX_ITEMS = 45;
        const COL_WIDTH = 100;
        const MAX_PER_COL = 3;

        const numCols = Math.floor(window.innerWidth / COL_WIDTH);
        const columnOccupancy = new Array(numCols).fill(0);

        const createRainDrop = (prewarm = false) => {
            if (container.children.length >= MAX_ITEMS) return;

            const item = musicList[Math.floor(Math.random() * musicList.length)];
            if (!item || !item.title) return;

            const el = document.createElement('div');
            el.className = 'falling-item';
            el.textContent = item.title;

            const size = Math.floor(Math.random() * 48) + 16;
            const color = effectConfig.colors.palette[Math.floor(Math.random() * effectConfig.colors.palette.length)];
            const font = effectConfig.fonts.families[Math.floor(Math.random() * effectConfig.fonts.families.length)];
            const speed = (Math.random() * 2) + 0.8;

            // Find column
            let col = -1;
            let minOccupancy = MAX_PER_COL + 1;

            for (let i = 0; i < numCols; i++) {
                if (columnOccupancy[i] < minOccupancy && columnOccupancy[i] < MAX_PER_COL) {
                    minOccupancy = columnOccupancy[i];
                    col = i;
                }
            }

            if (col === -1) {
                col = 0;
                minOccupancy = columnOccupancy[0];
                for (let i = 1; i < numCols; i++) {
                    if (columnOccupancy[i] < minOccupancy) {
                        minOccupancy = columnOccupancy[i];
                        col = i;
                    }
                }
            }

            columnOccupancy[col]++;
            const left = col * COL_WIDTH + (Math.random() * (COL_WIDTH - 60));

            el.style.fontSize = `${size}px`;
            el.style.color = color;
            el.style.fontFamily = font;
            el.style.left = `${left}px`;

            container.appendChild(el);

            // We need to wait for render to get offsetHeight, or guess it.
            // Since we are in JS, we can read it immediately after append.
            const textHeight = el.offsetHeight || 50;

            let pos = prewarm ?
                (Math.random() * (window.innerHeight - textHeight)) :
                (-(textHeight + 200) - Math.random() * 500);

            const update = () => {
                pos += speed;
                el.style.transform = `translateY(${pos}px)`;

                if (pos > window.innerHeight + 200) {
                    // Reset
                    const newItem = musicList[Math.floor(Math.random() * musicList.length)];
                    el.textContent = newItem.title;
                    el.style.color = effectConfig.colors.palette[Math.floor(Math.random() * effectConfig.colors.palette.length)];
                    el.style.fontSize = `${Math.floor(Math.random() * 48) + 16}px`;

                    const newHeight = el.offsetHeight || 50;
                    pos = -(newHeight + 200) - (Math.random() * 500);

                    // New column logic
                    let newCol = -1;
                    let newMinOccupancy = MAX_PER_COL + 1;
                    for (let i = 0; i < numCols; i++) {
                        if (columnOccupancy[i] < newMinOccupancy && columnOccupancy[i] < MAX_PER_COL) {
                            newMinOccupancy = columnOccupancy[i];
                            newCol = i;
                        }
                    }
                    if (newCol === -1) newCol = Math.floor(Math.random() * numCols);

                    columnOccupancy[col]--;
                    col = newCol;
                    columnOccupancy[col]++;

                    const newLeft = col * COL_WIDTH + (Math.random() * (COL_WIDTH - 60));
                    el.style.left = `${newLeft}px`;
                }

                if (el.parentElement) {
                    const id = requestAnimationFrame(update);
                    animFrameIds.current.push(id);
                } else {
                    columnOccupancy[col]--;
                }
            };

            const id = requestAnimationFrame(update);
            animFrameIds.current.push(id);

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(el.textContent || '')}`;
                window.open(url, '_blank');
            });
        };

        // Prewarm
        for (let i = 0; i < 35; i++) {
            setTimeout(() => createRainDrop(true), i * 120);
        }

        // Interval
        const intervalId = window.setInterval(() => {
            if (container.children.length < MAX_ITEMS) {
                createRainDrop(false);
            }
        }, 1000);
        intervalIds.current.push(intervalId);

        return () => {
            intervalIds.current.forEach(clearInterval);
            animFrameIds.current.forEach(cancelAnimationFrame);
            container.innerHTML = '';
        };
    }, [musicList]);

    return <div id="rain-container" ref={containerRef} />;
};

export default FallingRain;
