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

  setClock(time: string, day: number, icon: string): void {
    this.clock.textContent = time;
    this.dayText.textContent = 'Dia ' + day;
    this.dayIcon.textContent = icon;
  }

  setPopulation(count: number): void {
    this.populationText.textContent = count + (count === 1 ? ' morador' : ' moradores');
  }

  setInteractionHint(visible: boolean, label = 'conversar'): void {
    this.hint.innerHTML = 'Pressione <kbd>E</kbd> para ' + label;
    this.hint.classList.toggle('hidden', !visible);
  }

  setQuest(text: string): void {
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
