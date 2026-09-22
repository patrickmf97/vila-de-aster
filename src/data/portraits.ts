export const portraitByNpcId: Record<string, string> = {
  elena: new URL('../assets/portraits/elena.svg', import.meta.url).href,
  bram: new URL('../assets/portraits/bram.svg', import.meta.url).href,
  mira: new URL('../assets/portraits/mira.svg', import.meta.url).href,
  theo: new URL('../assets/portraits/theo.svg', import.meta.url).href,
  luma: new URL('../assets/portraits/luma.svg', import.meta.url).href,
};

export const playerPortrait =
  new URL('../assets/portraits/patrick.svg', import.meta.url).href;

const portraitByName: Record<string, string> = {
  Elena: portraitByNpcId.elena!,
  Bram: portraitByNpcId.bram!,
  Mira: portraitByNpcId.mira!,
  Theo: portraitByNpcId.theo!,
  Luma: portraitByNpcId.luma!,
  Patrick: playerPortrait,
};

export function portraitForNpc(
  npcId: string,
): string | undefined {
  return portraitByNpcId[npcId];
}

export function portraitForName(
  name: string,
): string | undefined {
  return portraitByName[name];
}
