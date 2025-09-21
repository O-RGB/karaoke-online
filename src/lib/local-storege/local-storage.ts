"use client";
export const crendentialKeys: { [key: string]: string } = {
  wallpaper: "wallpaper",
  song_count: "song_count",
  drive_url: "drive_url",
  drive_tested: "drive_tested",
  drive_tracklist_url: "drive_tracklist_url",
  system_drive_mode: "system_drive_mode",
  config: "config",
  lastUpdated: "lastUpdated",
  token: "token",
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
export const setLocalTracklistDriveTested = (url: string) => {
  localStorage.setItem(crendentialKeys.getLocalTracklistDriveUrl, `${url}`);
  return true;
};
export const setLocalSystemMode = (mode: SystemMode) => {
  localStorage.setItem(crendentialKeys.system_drive_mode, `${mode}`);
  return true;
};
export const setLocalLastUpdated = (lastIndex: string) => {
  localStorage.setItem(crendentialKeys.lastUpdated, `${lastIndex}`);
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
export const getLocalDriveTested = (): boolean => {
  const bool = localStorage.getItem(crendentialKeys.drive_tested) || null;
  if (bool === "true") {
    return true;
  } else {
    return false;
  }
};
export const getLocalTracklistDriveUrl = () => {
  return localStorage.getItem(crendentialKeys.drive_tracklist_url) || null;
};
export const getLocalSystemMode = (): SystemMode => {
  return (
    (localStorage.getItem(crendentialKeys.system_drive_mode) as SystemMode) ||
    null
  );
};
export const getLocalLastUpdated = (): string | null => {
  return (localStorage.getItem(crendentialKeys.lastUpdated) as string) || null;
};

// DELETE
export const destryoAllCredential = () => {
  localStorage.clear();
  return true;
};
