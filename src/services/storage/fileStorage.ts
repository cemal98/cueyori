import * as FileSystem from "expo-file-system";
import type { StateStorage } from "zustand/middleware";

const storageDirectory = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}cueyori/`
  : undefined;

const getStoragePath = (name: string): string | undefined =>
  storageDirectory
    ? `${storageDirectory}${encodeURIComponent(name)}.json`
    : undefined;

const ensureStorageDirectory = async () => {
  if (!storageDirectory) {
    return;
  }

  const directoryInfo = await FileSystem.getInfoAsync(storageDirectory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(storageDirectory, {
      intermediates: true,
    });
  }
};

export const fileStorage: StateStorage = {
  getItem: async (name) => {
    const storagePath = getStoragePath(name);

    if (!storagePath) {
      return null;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(storagePath);

      if (!fileInfo.exists) {
        return null;
      }

      return await FileSystem.readAsStringAsync(storagePath);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    const storagePath = getStoragePath(name);

    if (!storagePath) {
      return;
    }

    await ensureStorageDirectory();
    await FileSystem.writeAsStringAsync(storagePath, value);
  },
  removeItem: async (name) => {
    const storagePath = getStoragePath(name);

    if (!storagePath) {
      return;
    }

    await FileSystem.deleteAsync(storagePath, {
      idempotent: true,
    });
  },
};
