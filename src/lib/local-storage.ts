"use client";
const crendentialKeys: { [key: string]: string } = {
  wallpaper: "wallpaper",
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

export const destryoAllCredential = () => {
  localStorage.clear();
  return true;
};

// GET
export const getLocalWallpaper = () => {
  return localStorage.getItem(crendentialKeys.wallpaper) || null;
};
