import type { Mariachi } from '../src/config/mariachis';

// Solo pruebas: no se importan desde src/ ni se incluyen en dist/.
export const fixtures: readonly Mariachi[] = [
  { code: 'TEST-01', alias: 'Mariachi #01', active: true, categories: ['serenatas', 'celebraciones'], musicianCounts: [3, 5] },
  { code: 'TEST-02', alias: 'Mariachi #02', active: true, categories: ['serenatas', 'especiales'], musicianCounts: [6] },
  { code: 'TEST-OFF', alias: 'Mariachi #99', active: false, categories: ['celebraciones'], musicianCounts: [9] },
];
