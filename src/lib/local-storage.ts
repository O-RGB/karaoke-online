"use client";
const crendentialKeys: { [key: string]: string } = {
  wallpaper: "wallpaper",
  song_count: "song_count",
  drive_url: "drive_url",
  drive_tested: "drive_tested",
};

// SET

// FILE BASE 64
export const setLocalWallpaper = (wallpaper: string) => {
  localStorage.setItem(crendentialKeys.wallpaper, wallpaper);
  return true;
};

export const setLocalSongCount = (count: number) => {
  localStorage.setItem(crendentialKeys.song_count, `${count}`);
  return true;
};

export const setLocalDriveUrl = (url: string) => {
  localStorage.setItem(crendentialKeys.drive_url, url);
  return true;
};

export const setLocalDriveTested = (tested: boolean) => {
  localStorage.setItem(crendentialKeys.drive_tested, `${tested}`);
  return true;
};

// GET
export const getLocalWallpaper = () => {
  return localStorage.getItem(crendentialKeys.wallpaper) || null;
};

export const getLocalSongCount = () => {
  return localStorage.getItem(crendentialKeys.song_count) || null;
};
export const getLocalDriveUrl = () => {
  return localStorage.getItem(crendentialKeys.drive_url) || null;
};
export const getLocalDriveTested = () => {
  return localStorage.getItem(crendentialKeys.drive_tested) || null;
};

// DELETE
export const destryoAllCredential = () => {
  localStorage.clear();
  return true;
};
