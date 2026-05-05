import './style.css';
import { GameApp } from './game/GameApp';

const root = document.querySelector<HTMLDivElement>('#game-root');
const debugPanel = document.querySelector<HTMLDivElement>('#debug-panel');

if (!root || !debugPanel) {
  throw new Error('Missing application root element.');
}

const game = new GameApp({
  root,
  debugPanel,
  debug: new URLSearchParams(window.location.search).get('debug') === 'true',
});

void game.start();
