export class TimeSystem {
  day: number;
  minutes: number;

  constructor(day = 1, minutes = 8 * 60) {
    this.day = day;
    this.minutes = minutes;
  }

  update(deltaSeconds: number): boolean {
    this.minutes += deltaSeconds * 5.2;
    if (this.minutes >= 1440) {
      this.minutes -= 1440;
      this.day += 1;
      return true;
    }
    return false;
  }

  get minuteOfDay(): number {
    return ((this.minutes % 1440) + 1440) % 1440;
  }

  get formatted(): string {
    const mins = Math.floor(this.minuteOfDay);
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  get icon(): string {
    const mins = this.minuteOfDay;
    if (mins < 360 || mins >= 1200) return '🌙';
    if (mins < 480 || mins >= 1080) return '🌅';
    return '☀️';
  }

  get darkness(): number {
    const m = this.minuteOfDay;
    if (m < 360) return 0.42;
    if (m < 480) return 0.42 * ((480 - m) / 120);
    if (m > 1080) return 0.42 * Math.min(1, (m - 1080) / 120);
    return 0;
  }
}
