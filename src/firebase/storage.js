// src/firebase/storage.js
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config.js';

/**
 * Upload a base64 dataURL photo to Firebase Storage.
 * Returns the public download URL.
 *
 * Path: inspections/{inspectionId}/{type}/{filename}
 * type = 'normal' | 'damage'
 */
export const uploadPhoto = async (dataUrl, inspectionId, type, filename) => {
  const path      = `inspections/${inspectionId}/${type}/${filename}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
};

/**
 * Upload all photos for one inspection.
 * photos = { front: dataUrl, rear: dataUrl, ... }
 * damagePhotos = [dataUrl, ...]
 * Returns { photoURLs: {side: url}, damagePhotoURLs: [url] }
 */
export const uploadInspectionPhotos = async (inspectionId, photos, damagePhotos = []) => {
  const photoURLs = {};

  // Normal sides
  await Promise.all(
    Object.entries(photos).map(async ([side, dataUrl]) => {
      if (!dataUrl) return;
      photoURLs[side] = await uploadPhoto(dataUrl, inspectionId, 'normal', `${side}.jpg`);
    })
  );

  // Damage photos
  const damagePhotoURLs = await Promise.all(
    damagePhotos.map((dataUrl, i) =>
      uploadPhoto(dataUrl, inspectionId, 'damage', `damage_${i}.jpg`)
    )
  );

  return { photoURLs, damagePhotoURLs };
};
