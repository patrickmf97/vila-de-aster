export interface DialoguePayload {
  name: string;
  role: string;
  portrait: string;
  lines: string[];
  onClose?: () => void;
}

export class DialogueSystem {
  private root = document.getElementById('dialogue')!;
  private name = document.getElementById('dialogueName')!;
  private text = document.getElementById('dialogueText')!;
  private portrait = document.getElementById('portrait')!;
  private current: DialoguePayload | null = null;
  private index = 0;

  get isOpen(): boolean {
    return this.current !== null;
  }

  open(payload: DialoguePayload): void {
    this.current = payload;
    this.index = 0;
    this.render();
  }

  advance(): void {
    if (!this.current) return;
    this.index += 1;
    if (this.index >= this.current.lines.length) {
      const onClose = this.current.onClose;
      this.current = null;
      this.root.classList.add('hidden');
      onClose?.();
      return;
    }
    this.render();
  }

  private render(): void {
    if (!this.current) return;
    this.name.textContent = `${this.current.name} • ${this.current.role}`;
    this.text.textContent = this.current.lines[this.index];
    this.portrait.textContent = this.current.portrait;
    this.root.classList.remove('hidden');
  }
}
