"use client";
const crendentialKeys: { [key: string]: string } = {
  wallpaper: "wallpaper",
  song_count: "song_count",
};

// SET

// FILE BASE 64
export const setLocalWallpaper = (wallpaper: string) => {
  const setWallpaper = localStorage.setItem(
    crendentialKeys.wallpaper,
    wallpaper
  );
  return true;
};

export const setLocalSongCount = (count: number) => {
  const setSongCount = localStorage.setItem(
    crendentialKeys.song_count,
    `${count}`
  );
  return true;
};

// GET
export const getLocalWallpaper = () => {
  return localStorage.getItem(crendentialKeys.wallpaper) || null;
};

export const getLocalSongCount = () => {
  return localStorage.getItem(crendentialKeys.song_count) || null;
};

// DELETE
export const destryoAllCredential = () => {
  localStorage.clear();
  return true;
};
