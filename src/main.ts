import { EffectManager } from './core/EffectManager';
import { NeonMarqueeEffect } from './effects/NeonMarqueeEffect';
import { RecordPlayerNeonEffect } from './effects/RecordPlayerNeonEffect';
import { RecordPlayerMinimalEffect } from './effects/RecordPlayerMinimalEffect';
import { VerticalRainEffect } from './effects/VerticalRainEffect';
import { ParticleExplosionEffect } from './effects/ParticleExplosionEffect';
import { TypographyMosaicEffect } from './effects/TypographyMosaicEffect';
import { MUSIC_LIST } from './data';

// Effect Metadata
const EFFECTS_METADATA = [
    {
        id: 'neon-marquee',
        name: '💡 Neon Marquee',
        description: 'Glowing text scrolling in opposite directions',
        classRef: NeonMarqueeEffect
    },
    {
        id: 'record-player-neon',
        name: '💡 Neon Cyber',
        description: 'Futuristic neon glowing record',
        classRef: RecordPlayerNeonEffect
    },
    {
        id: 'record-player-minimal',
        name: '⚪ Minimalist',
        description: 'Clean, abstract rotation',
        classRef: RecordPlayerMinimalEffect
    },
    {
        id: 'particle-explosion',
        name: '💥 Particle Explosion',
        description: 'Fireworks launching and exploding into text',
        classRef: ParticleExplosionEffect
    },
    {
        id: 'typography-mosaic',
        name: '🎨 Mosaic Spectrum',
        description: 'Infinite drifting grid with spectrum bars',
        classRef: TypographyMosaicEffect
    },

    {
        id: 'vertical-rain',
        name: '☔ Vertical Rain',
        description: 'Falling text in vertical writing mode',
        classRef: VerticalRainEffect
    }
];

export function initializeApp() {
    const container = document.getElementById('visualizer-container');
    if (!container) {
        console.error('Visualizer container not found');
        return;
    }

    const effectManager = EffectManager.getInstance();

    // Initialize Manager
    effectManager.initialize(container, MUSIC_LIST);

    // Register Effects
    EFFECTS_METADATA.forEach(meta => {
        // Construct metadata object expected by EffectManager
        const effectMeta = {
            id: meta.id,
            name: meta.name,
            description: meta.description,
            icon: '', // Optional
            difficulty: 'medium' as const,
            performanceImpact: 'medium' as const
        };

        effectManager.registerEffect(meta.id, effectMeta, meta.classRef);
    });

    // UI Controls
    const effectNameEl = document.getElementById('effectName');
    const randomBtn = document.getElementById('randomEffect');
    const nextBtn = document.getElementById('nextEffect');

    let currentEffectIndex = -1;

    async function loadEffect(index: number) {
        if (index < 0 || index >= EFFECTS_METADATA.length) return;

        currentEffectIndex = index;
        const meta = EFFECTS_METADATA[index];

        if (effectNameEl) {
            effectNameEl.textContent = meta.name;
        }

        try {
            await effectManager.switchEffect(meta.id);
        } catch (error) {
            console.error('Failed to load effect:', error);
        }
    }

    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * EFFECTS_METADATA.length);
            loadEffect(randomIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const nextIndex = (currentEffectIndex + 1) % EFFECTS_METADATA.length;
            loadEffect(nextIndex);
        });
    }

    // Start random effect initially
    const initialIndex = Math.floor(Math.random() * EFFECTS_METADATA.length);
    loadEffect(initialIndex);
}
