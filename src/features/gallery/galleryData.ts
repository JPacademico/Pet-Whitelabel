import type { AnimalType } from '@/domain/types';

export interface GalleryPhoto {
  id: string;
  animalType: AnimalType;
  alt: string;
  /** Aspect ratio hint so the masonry grid reserves the right space (CLS = 0). */
  ratio: 'tall' | 'square' | 'wide';
  url: string;
  fullUrl: string;
}

const RATIO_SIZES = {
  tall: [600, 800],
  square: [600, 600],
  wide: [600, 440],
} as const;

/**
 * Placeholder pet photography, keyword-locked so each tile keeps a stable, on-theme image.
 * `lock` makes the choice deterministic — without it every reload reshuffles the gallery.
 * Replace with the establishment's real photos before launch (Appendix C item 2).
 */
function photo(
  id: string,
  animalType: AnimalType,
  keywords: string,
  alt: string,
  ratio: GalleryPhoto['ratio'],
  lock: number,
): GalleryPhoto {
  const [w, h] = RATIO_SIZES[ratio];
  return {
    id,
    animalType,
    alt,
    ratio,
    url: `https://loremflickr.com/${w}/${h}/${keywords}?lock=${lock}`,
    fullUrl: `https://loremflickr.com/1200/1500/${keywords}?lock=${lock}`,
  };
}

export const galleryPhotos: GalleryPhoto[] = [
  photo('g1', 'dog', 'golden,retriever', 'Golden retriever sorridente após o banho', 'tall', 501),
  photo('g2', 'cat', 'tabby,cat', 'Gato malhado relaxando após a tosa', 'square', 502),
  photo('g3', 'dog', 'puppy,dog', 'Filhote recém-banhado enrolado na toalha', 'wide', 503),
  photo('g4', 'cat', 'siamese,cat', 'Gato siamês com laço após o banho', 'tall', 504),
  photo('g5', 'dog', 'poodle', 'Poodle tosado no estilo teddy bear', 'square', 505),
  photo('g6', 'cat', 'persian,cat', 'Filhote de gato persa recém-escovado', 'tall', 506),
  photo('g7', 'dog', 'shihtzu,dog', 'Shih tzu com a pelagem escovada', 'wide', 507),
  photo('g8', 'cat', 'ginger,cat', 'Gato laranja em consulta veterinária', 'square', 508),
  photo('g9', 'dog', 'labrador', 'Labrador aguardando atendimento na clínica', 'tall', 509),
  photo('g10', 'cat', 'blackandwhite,cat', 'Gato preto e branco em dia de spa', 'wide', 510),
  photo('g11', 'dog', 'frenchbulldog', 'Bulldog francês com laço colorido', 'square', 511),
  photo('g12', 'cat', 'kitten,playing', 'Gatinho brincando com novelo de lã', 'tall', 512),
  photo('g13', 'dog', 'yorkshire,terrier', 'Yorkshire com tosa higiênica', 'square', 513),
  photo('g14', 'cat', 'cat,sleeping', 'Gata descansando no hotel', 'wide', 514),
  photo('g15', 'dog', 'germanshepherd', 'Pastor alemão após o check-up', 'tall', 515),
  photo('g16', 'cat', 'grey,cat', 'Gato cinza no espaço do hotel', 'square', 516),
];
