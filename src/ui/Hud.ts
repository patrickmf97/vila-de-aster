import {
  playerPortrait,
  portraitByNpcId,
} from '../data/portraits';

export class Hud {
  private clock = document.getElementById('clock')!;
  private dayText = document.getElementById('dayText')!;
  private dayIcon = document.getElementById('dayIcon')!;
  private populationText = document.getElementById('populationText')!;
  private hint = document.getElementById('hint')!;
  private toast = document.getElementById('toast')!;
  private questText = document.querySelector('#quest span')!;
  private brainDebug = document.getElementById('brainDebug')!;
  private brainDebugContent = document.getElementById('brainDebugContent')!;
  private brainDebugSignature = '';
  private economyDebug = document.getElementById('economyDebug')!;
  private economyDebugContent = document.getElementById('economyDebugContent')!;
  private economyDebugSignature = '';
  private codex = document.getElementById('codex')!;
  private codexTitle = document.getElementById('codexTitle')!;
  private toastTimer: number | undefined;
  private lastClock = '';
  private lastDay = -1;
  private lastIcon = '';
  private lastPopulation = -1;
  private lastHint = '';
  private lastHintVisible = false;
  private lastQuest = '';

  constructor() {
    this.setupConceptUi();
  }

  get isModalOpen(): boolean {
    return !this.codex.classList.contains('hidden');
  }

  setClock(time: string, day: number, icon: string): void {
    if (time !== this.lastClock) {
      this.lastClock = time;
      this.clock.textContent = time;
    }

    if (day !== this.lastDay) {
      this.lastDay = day;
      this.dayText.textContent = 'Dia ' + day;
    }

    if (icon !== this.lastIcon) {
      this.lastIcon = icon;
      this.dayIcon.textContent = icon;
    }
  }

  setPopulation(count: number): void {
    if (count === this.lastPopulation) return;
    this.lastPopulation = count;
    this.populationText.textContent =
      count + (count === 1 ? ' morador' : ' moradores');
  }

  setInteractionHint(visible: boolean, label = 'conversar'): void {
    if (visible !== this.lastHintVisible) {
      this.lastHintVisible = visible;
      this.hint.classList.toggle('hidden', !visible);
    }

    if (visible && label !== this.lastHint) {
      this.lastHint = label;
      this.hint.innerHTML = 'Pressione <kbd>E</kbd> para ' + label;
    }
  }

  setQuest(text: string): void {
    if (text === this.lastQuest) return;
    this.lastQuest = text;
    this.questText.textContent = text;
  }

  setRiverQuest(): void {
    this.setQuest(
      'Algo despertou perto do rio. Converse com os moradores para juntar pistas.',
    );
  }

  toggleBrainDebug(): void {
    this.brainDebug.classList.toggle('hidden');
  }

  setBrainDebug(lines: string[]): void {
    const signature = lines.join('\n');
    if (signature === this.brainDebugSignature) return;
    this.brainDebugSignature = signature;

    this.brainDebugContent.replaceChildren(
      ...lines.map((line) => {
        const row = document.createElement('div');
        row.className = 'brain-debug-row';
        row.textContent = line;
        return row;
      }),
    );
  }

  toggleEconomyDebug(): void {
    this.economyDebug.classList.toggle('hidden');
  }

  setEconomyDebug(lines: string[]): void {
    const signature = lines.join('\n');
    if (signature === this.economyDebugSignature) return;
    this.economyDebugSignature = signature;

    this.economyDebugContent.replaceChildren(
      ...lines.map((line) => {
        const row = document.createElement('div');
        row.className = 'economy-debug-row';
        row.textContent = line;
        return row;
      }),
    );
  }

  showToast(message: string): void {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.toastTimer = window.setTimeout(
      () => this.toast.classList.add('hidden'),
      3200,
    );
  }

  private setupConceptUi(): void {
    const playerImage = document.getElementById('playerPortrait') as HTMLImageElement | null;
    if (playerImage) {
      playerImage.src = playerPortrait;
    }

    const portraitElements = document.querySelectorAll<HTMLImageElement>(
      '[data-portrait]',
    );

    portraitElements.forEach((image) => {
      const id = image.dataset.portrait;
      if (!id) return;

      const source =
        id === 'patrick'
          ? playerPortrait
          : portraitByNpcId[id];

      if (source) image.src = source;
    });

    const panelButtons = document.querySelectorAll<HTMLButtonElement>(
      '[data-panel]',
    );

    panelButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const panel = button.dataset.panel;
        if (panel) this.openCodex(panel);
      });
    });

    document
      .getElementById('codexClose')
      ?.addEventListener('click', () => this.closeCodex());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.codex.classList.contains('hidden')) {
        this.closeCodex();
      }

      const slot = Number(event.key);
      if (slot >= 1 && slot <= 8) {
        this.setHotbarSlot(slot - 1);
      }
    });

    document
      .querySelectorAll<HTMLButtonElement>('.slot')
      .forEach((button, index) => {
        button.addEventListener('click', () => this.setHotbarSlot(index));
      });
  }

  private openCodex(panel: string): void {
    const normalized =
      panel === 'characters' ||
      panel === 'village' ||
      panel === 'cycle' ||
      panel === 'map'
        ? panel
        : 'characters';

    const titles: Record<string, string> = {
      characters: 'Personagens Principais',
      village: 'Construções de Aster',
      cycle: 'Ciclo de Dia e Noite',
      map: 'Mapa do Mundo',
    };

    document
      .querySelectorAll<HTMLElement>('.codex-page')
      .forEach((page) => {
        page.classList.toggle(
          'hidden',
          page.dataset.page !== normalized,
        );
      });

    document
      .querySelectorAll<HTMLButtonElement>('.codex-tabs [data-panel]')
      .forEach((button) => {
        button.classList.toggle(
          'active',
          button.dataset.panel === normalized,
        );
      });

    this.codexTitle.textContent = titles[normalized] ?? 'Vila de Aster';
    this.codex.classList.remove('hidden');
  }

  private closeCodex(): void {
    this.codex.classList.add('hidden');
  }

  private setHotbarSlot(index: number): void {
    const slots = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.slot'),
    );

    slots.forEach((slot, slotIndex) => {
      slot.classList.toggle('active', slotIndex === index);
    });
  }
}
