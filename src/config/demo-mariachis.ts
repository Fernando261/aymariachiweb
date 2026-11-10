import type { Mariachi } from './mariachis';

export const demoMariachis: readonly Mariachi[] = [
  {
    code: 'DEMO-01',
    alias: 'Mariachi #01',
    categories: ['serenatas', 'celebraciones'],
    musicianCounts: [4, 6],
    active: true,
    zone: 'Guadalajara Centro y alrededores',
    description: 'Repertorio romántico y tradicional para dedicatorias, aniversarios y serenatas sorpresa.',
    photo: 'mariachis-demo/grupo-01.webp',
    durationMinutes: [30, 45],
  },
  {
    code: 'DEMO-02',
    alias: 'Mariachi #02',
    categories: ['celebraciones', 'especiales'],
    musicianCounts: [5, 7],
    active: true,
    zone: 'Zapopan',
    description: 'Sones y rancheras para cumpleaños, reuniones y recepciones con un ambiente festivo.',
    photo: 'mariachis-demo/grupo-02.webp',
    durationMinutes: [45, 60],
  },
  {
    code: 'DEMO-03',
    alias: 'Mariachi #03',
    categories: ['serenatas', 'especiales'],
    musicianCounts: [6, 8],
    active: true,
    zone: 'Tlaquepaque y Tonalá',
    description: 'Música para entradas, valses y momentos especiales en bodas y reuniones familiares.',
    photo: 'mariachis-demo/grupo-03.webp',
    durationMinutes: [45, 60],
  },
];
