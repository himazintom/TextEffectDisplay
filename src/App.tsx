import { useState, useEffect, useRef } from 'react';
import './styles/main.scss'; // Import SCSS
import { MUSIC_TREE } from './data';
import { initializeApp } from './main';
import Browser from './Browser';

type ViewMode = 'browser' | 'effects';

function App() {
  const [view, setView] = useState<ViewMode>('effects');
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we switched to effects view and the container is ready, initialize
    if (view === 'effects' && visualizerContainerRef.current) {
      // We might need to clear previous content if any, 
      // but EffectManager handles its own cleanup usually.
      // However, initializeApp attaches event listeners to buttons which are also re-rendered.
      // Since buttons are in the DOM now, we can call initializeApp.
      initializeApp();
    }
  }, [view]);

  return (
    <div className="app">
      <nav>
        <a
          className={view === 'browser' ? 'active' : ''}
          onClick={() => setView('browser')}
        >
          Library Browser
        </a>

        <a
          className={view === 'effects' ? 'active' : ''}
          onClick={() => setView('effects')}
        >
          All Effects
        </a>

        {view === 'effects' && (
          <div className="effect-controls">
            <span id="effectName">Loading...</span>
            <button id="randomEffect">Random Effect</button>
            <button id="nextEffect">Next Effect</button>
          </div>
        )}
      </nav>

      <main style={{ position: 'relative', width: '100vw', height: '100vh', top: 0, left: 0 }}>
        {view === 'browser' && <Browser tree={MUSIC_TREE} />}



        {view === 'effects' && (
          <div id="visualizer-container" ref={visualizerContainerRef}></div>
        )}
      </main>
    </div>
  );
}

export default App;
