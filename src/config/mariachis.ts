export const categories = [
  { id: 'serenatas', label: 'Serenatas' },
  { id: 'celebraciones', label: 'Celebraciones' },
  { id: 'especiales', label: 'Eventos especiales' },
] as const;

export type Category = typeof categories[number]['id'];

/** Solo información pública aprobada. Nunca nombres reales ni datos privados. */
export type Mariachi = {
  code: string;
  alias: `Mariachi #${string}`;
  categories: readonly Category[];
  musicianCounts: readonly number[];
  active: boolean;
  zone?: string;
  description?: string;
  /** Ruta relativa a public/, sin barra inicial. */
  photo?: string;
  durationMinutes?: readonly number[];
};

// Catálogo de grupos aprobados. Mientras esté vacío se muestran referencias ilustrativas.
export const mariachis: readonly Mariachi[] = [];
