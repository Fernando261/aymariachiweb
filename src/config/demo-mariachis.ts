import type { Mariachi } from './mariachis';

export const demoMariachis: readonly Mariachi[] = [
  {
    code: 'DEMO-01',
    alias: 'Mariachi #01',
    categories: ['serenatas', 'celebraciones', 'aniversarios', 'pedidas', 'homenajes', 'misas'],
    musicianCounts: [3, 4, 5, 6],
    active: true,
    zone: 'Guadalajara Centro y alrededores',
    description: 'Repertorio romántico y tradicional para dedicatorias, aniversarios y serenatas sorpresa.',
    photo: 'mariachis-demo/grupo-01.webp',
  },
  {
    code: 'DEMO-02',
    alias: 'Mariachi #02',
    categories: ['celebraciones', 'especiales', 'cumpleanos', 'graduaciones', 'fiestas-patrias', 'empresariales'],
    musicianCounts: [5],
    active: true,
    zone: 'Zapopan',
    description: 'Sones y rancheras para cumpleaños, reuniones y recepciones con un ambiente festivo.',
    photo: 'mariachis-demo/grupo-02.webp',
  },
  {
    code: 'DEMO-03',
    alias: 'Mariachi #03',
    categories: ['serenatas', 'especiales', 'bodas', 'quinceanos', 'aniversarios'],
    musicianCounts: [6],
    active: true,
    zone: 'Tlaquepaque y Tonalá',
    description: 'Música para entradas, valses y momentos especiales en bodas y reuniones familiares.',
    photo: 'mariachis-demo/grupo-03.webp',
  },
];
