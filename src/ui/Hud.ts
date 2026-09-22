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
  private toastTimer: number | undefined;
  private lastClock = '';
  private lastDay = -1;
  private lastIcon = '';
  private lastPopulation = -1;
  private lastHint = '';
  private lastHintVisible = false;
  private lastQuest = '';

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
    this.setQuest('Algo despertou perto do rio. Converse com os moradores para juntar pistas.');
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
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toast.classList.add('hidden'), 3200);
  }
}
