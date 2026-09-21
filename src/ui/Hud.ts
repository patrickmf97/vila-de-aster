export class Hud {
  private clock = document.getElementById('clock')!;
  private dayText = document.getElementById('dayText')!;
  private dayIcon = document.getElementById('dayIcon')!;
  private hint = document.getElementById('hint')!;
  private toast = document.getElementById('toast')!;
  private questText = document.querySelector('#quest span')!;
  private toastTimer: number | undefined;

  setClock(time: string, day: number, icon: string): void {
    this.clock.textContent = time;
    this.dayText.textContent = `Dia ${day}`;
    this.dayIcon.textContent = icon;
  }

  setInteractionHint(visible: boolean, label = 'conversar'): void {
    this.hint.innerHTML = `Pressione <kbd>E</kbd> para ${label}`;
    this.hint.classList.toggle('hidden', !visible);
  }

  setQuest(text: string): void {
    this.questText.textContent = text;
  }

  setRiverQuest(): void {
    this.setQuest('Algo despertou perto do rio. Converse com os moradores para juntar pistas.');
  }

  showToast(message: string): void {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toast.classList.add('hidden'), 3200);
  }
}
