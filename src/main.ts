import Phaser from 'phaser';
import './styles.css';
import { VillageScene } from './scenes/VillageScene';
import { InteriorScene } from './scenes/InteriorScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#15231f',
  scene: [VillageScene, InteriorScene],
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
