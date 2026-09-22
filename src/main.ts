import Phaser from 'phaser';
import './styles.css';
import { VillageScene } from './scenes/VillageScene';
import { InteriorScene } from './scenes/InteriorScene';

export interface MobileControlsState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  chat: boolean;
}

declare global {
  interface Window {
    asterMobile?: MobileControlsState;
  }
}

const mobile =
  window.matchMedia('(pointer: coarse)').matches ||
  navigator.maxTouchPoints > 0 ||
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

document.documentElement.classList.toggle('is-mobile', mobile);

const controls: MobileControlsState = {
  up: false,
  down: false,
  left: false,
  right: false,
  interact: false,
  chat: false,
};
window.asterMobile = controls;

if (mobile) {
  const held = document.querySelectorAll<HTMLButtonElement>('[data-hold]');
  for (const button of held) {
    const key = button.dataset.hold as keyof Pick<
      MobileControlsState,
      'up' | 'down' | 'left' | 'right'
    >;

    const press = (event: PointerEvent) => {
      event.preventDefault();
      controls[key] = true;
      button.classList.add('pressed');
      button.setPointerCapture?.(event.pointerId);
    };
    const release = (event: PointerEvent) => {
      event.preventDefault();
      controls[key] = false;
      button.classList.remove('pressed');
    };

    button.addEventListener('pointerdown', press, { passive: false });
    button.addEventListener('pointerup', release, { passive: false });
    button.addEventListener('pointercancel', release, { passive: false });
    button.addEventListener('lostpointercapture', () => {
      controls[key] = false;
      button.classList.remove('pressed');
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-tap]')) {
    const key = button.dataset.tap as 'interact' | 'chat';
    button.addEventListener(
      'pointerdown',
      (event) => {
        event.preventDefault();
        controls[key] = true;
        button.classList.add('pressed');
      },
      { passive: false },
    );
    const release = (event: PointerEvent) => {
      event.preventDefault();
      button.classList.remove('pressed');
    };
    button.addEventListener('pointerup', release, { passive: false });
    button.addEventListener('pointercancel', release, { passive: false });
  }

  document.addEventListener('contextmenu', (event) => {
    if ((event.target as Element | null)?.closest('#mobileControls')) {
      event.preventDefault();
    }
  });
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#15231f',
  scene: [VillageScene, InteriorScene],
  fps: {
    target: 60,
    min: 30,
    smoothStep: true,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

new Phaser.Game(config);
