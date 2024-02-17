// TYPE DEFINITIONS

export type CurrentlyPlaying = {
    message: string;
    device?: Device;
    repeat_state?: string; // "off" | "track" | "context"
    shuffle_state?: boolean;
    timestamp?: number;
    progress_ms?: number;
    is_playing?: boolean;
    currently_playing_type?: string; // "track" | "episode" | "ad" | "unknown"
    item: TrackObject | EpisodeObject | undefined;
};

export type Device = {
    id: string;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
    supports_volume: boolean;
};

//#region TrackObject
export type TrackObject = {
    id: string;
    name: string;
    album: Album;
    track_number: number;
    artists: Artist[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    popularity: number;
    external_urls: ExternalURLs;
    is_playable: boolean;
    restrictions: Restriction;
    is_local: boolean;
    preview_url: string;
};

export type Album = {
    album_type: string;
    total_tracks: number;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    restrictions: Restriction;
    type: string;
    uri: string;
    artists: Artist[];
};

type Image = {
    url: string;
    height: number;
    width: number;
};

type Restriction = {
    reason: string;
};

export type Artist = {
    id: string;
    name: string;
    images: Image[];
    genres: string[];
    popularity: number;
    external_urls: ExternalURLs;
    href: string;
    uri: string;
};

type ExternalURLs = {
    spotify: string;
};
//#endregion
//#region EpisodeObject
export type EpisodeObject = {
    id: string;
    name: string;
    release_date: string;
    release_date_precision: string;
    show: Show;
    resume_point: ResumePoint;
    audio_preview_url: string;
    description: string;
    duration_ms: number;
    explicit: boolean;
    external_urls: ExternalURLs;
    images: Image[];
    is_playable: boolean;
    restrictions: Restriction;
};

export type Show = {
    id: string;
    name: string;
    publisher: string;
    external_urls: ExternalURLs;
    images: Image[];
    media_type: string;
    description: string;
    explicit: boolean;
    total_episodes: number;
};

type ResumePoint = {
    fully_played: boolean;
    resume_position_ms: number;
};
//#endregion

import { pick } from "lodash";

const getAccessToken = async (): Promise<string> => {
    const refreshToken: string = process.env.SPOTIFY_REFRESH_TOKEN as string;

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    });

    const json = await response.json();

    return json.access_token as string;
};

export const getCurrentlyPlaying = async (): Promise<CurrentlyPlaying> => {
    const accessToken = await getAccessToken();
    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (response.status === 204) {
        return {
            message: "No content",
            item: undefined,
        };
    }
    const json = await response.json();

    const currentPlayingKeys: string[] = [
        "device",
        "repeat_state",
        "shuffle_state",
        "timestamp",
        "progress_ms",
        "is_playing",
        "currently_playing_type",
        "item",
    ];

    const currentlyPlaying = pick(json, currentPlayingKeys) as CurrentlyPlaying;
    currentlyPlaying.message = "ok";

    const deviceKeys = [
        "id",
        "is_active",
        "is_private_session",
        "is_restricted",
        "name",
        "type",
        "volume_percent",
        "supports_volume",
    ];

    currentlyPlaying.device = pick(
        currentlyPlaying.device,
        deviceKeys
    ) as Device;

    const itemKeys = [
        "id",
        "name",
        "album",
        "track_number",
        "artists",
        "disc_number",
        "duration_ms",
        "explicit",
        "popularity",
        "external_urls",
        "is_playable",
        "restrictions",
        "is_local",
        "preview_url",
    ];

    const albumKeys = [
        "album_type",
        "total_tracks",
        "href",
        "id",
        "images",
        "name",
        "release_date",
        "release_date_precision",
        "restrictions",
        "type",
        "uri",
        "artists",
    ];

    const artistKeys = [
        "id",
        "name",
        "images",
        "genres",
        "popularity",
        "external_urls",
        "href",
        "uri",
    ];

    const episodeKeys = [
        "id",
        "name",
        "release_date",
        "release_date_precision",
        "show",
        "resume_point",
        "audio_preview_url",
        "description",
        "duration_ms",
        "explicit",
        "external_urls",
        "images",
        "is_playable",
        "restrictions",
    ];

    if (currentlyPlaying.currently_playing_type === "track") {
        currentlyPlaying.item = pick(
            currentlyPlaying.item,
            itemKeys
        ) as TrackObject;
        currentlyPlaying.item.album = pick(
            currentlyPlaying.item.album,
            albumKeys
        ) as Album;
        for (let i = 0; i < currentlyPlaying.item.artists.length; i++) {
            currentlyPlaying.item.artists[i] = pick(
                currentlyPlaying.item.artists[i],
                artistKeys
            ) as Artist;
        }
    } else {
        currentlyPlaying.item = pick(
            currentlyPlaying.item,
            episodeKeys
        ) as EpisodeObject;
    }

    return currentlyPlaying;
};
