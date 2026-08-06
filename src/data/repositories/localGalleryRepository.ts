import type { GalleryPhoto, NewGalleryPhoto } from '@/domain/types';
import { galleryPhotoListSchema } from '@/domain/schemas';
import { readCollection, writeCollection } from '@/data/storage/driver';
import { STORAGE_KEYS } from '@/data/storage/keys';
import { simulatedLatency } from '@/lib/delay';
import { useDataVersion } from '@/store/dataVersion';
import type { GalleryRepository } from '@/data/ports';

function readAll(): GalleryPhoto[] {
  return readCollection(STORAGE_KEYS.galleryPhotos, galleryPhotoListSchema);
}

function writeAll(photos: GalleryPhoto[]): void {
  writeCollection(STORAGE_KEYS.galleryPhotos, photos);
}

export const localGalleryRepository: GalleryRepository = {
  async list() {
    await simulatedLatency();
    // Newest first, so a freshly added photo shows up at the top of both the admin grid and the
    // public gallery instead of being buried at the end.
    return [...readAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: NewGalleryPhoto) {
    await simulatedLatency();
    const photo: GalleryPhoto = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    writeAll([photo, ...readAll()]);
    useDataVersion.getState().bump('gallery');
    return photo;
  },

  async remove(id: string) {
    await simulatedLatency();
    writeAll(readAll().filter((p) => p.id !== id));
    useDataVersion.getState().bump('gallery');
  },
};
