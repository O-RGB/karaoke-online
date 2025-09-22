export interface ProfileDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  is_banned?: boolean;
}

export interface UpdateProfileBody
  extends Omit<
    ProfileDetails,
    "email" | "role" | "created_at" | "updated_at" | "is_banned"
  > {}

export interface IMusicDetails {
  title: string;
  artist: string;
  album: string;
  music_code: string;
  direct_link: string;
  id: string;
  uploader_id: string;
  play_count: number;
  like_count: number;
  bookmark_count: number;
  dislike_count?: number;
  signature?: string;
  created_at: string;
  updated_at: string;
}

export interface MusicCreate
  extends Pick<
    IMusicDetails,
    "title" | "artist" | "album" | "music_code" | "direct_link" | "signature"
  > {}

export interface MusicSearch
  extends Pick<
    IMusicDetails,
    "title" | "artist" | "album" | "music_code" | "direct_link"
  > {
  id: string;
  uploader_name: string;
  play_count: number;
  like_count: number;
}
