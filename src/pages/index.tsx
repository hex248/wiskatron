import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import ProgressBar from "@/components/progressbar";

const inter = Inter({ subsets: ["latin"] });

import { useState, useEffect } from "react";
import { Artist } from "../lib/spotify";

const formatMSToMins = (ms: number | undefined) => {
    if (!ms) return "0:00";
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);
    if (seconds == "60") {
        minutes++;
        seconds = "0";
    }
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
};

export default function Home() {
    const [ID, setID] = useState("NONE");
    const [name, setName] = useState("");
    const [album, setAlbum] = useState("");
    const [artists, setArtists] = useState<string[]>([]);
    const [artistImages, setArtistImages] = useState<string[]>([]);
    const [podcast, setPodcast] = useState("");
    const [image, setImage] = useState("/placeholder.png");
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressMS, setProgressMS] = useState(0);
    const [durationMS, setDurationMS] = useState(0);
    const [isPlaylist, setIsPlaylist] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistImage, setPlaylistImage] = useState("");
    const [playlistAuthor, setPlaylistAuthor] = useState("");
    const [playlistDescription, setPlaylistDescription] = useState("");

    const [background, setBackground] = useState("#000000");
    const [foreground, setForeground] = useState("#ffffff");

    const formatName = (name: string) => {
        let newName = name;
        newName = newName.split(" (with")[0];
        newName = newName.split(" (feat")[0];
        newName = newName.split(" (ft")[0];
        return newName;
    };

    const fetchPlaying = async () => {
        const res = await fetch(`/api/playing`);
        const data = await res.json();
        if (data.item) {
            let item = data.item;
            setID(item.id);
            setName(formatName(item.name));
            setAlbum(item.album.name);
            setArtists(item.artists.map((a: Artist) => a.name));
            setArtistImages(item.artistImages || []);
            setPodcast(item.type === "episode" ? item.show.name : "");
            // if (item.album?.images && item.album.images.length > 0) {
            setImage(item.album.images[0]?.url || "/placeholder.png");
            // }

            setIsPlaying(data.is_playing);
            setProgressMS(data.progress_ms);
            setDurationMS(item.duration_ms);
            setIsPlaylist(data.isPlaylist);
            setPlaylistName(data.playlistName);
            setPlaylistImage(data.playlistImage);
            setPlaylistAuthor(data.playlistAuthor);
            setPlaylistDescription(data.playlistDescription);

            if (item.album.images.length > 0) {
                const res2 = await fetch("/api/colorFromImage", {
                    method: "POST",
                    body: item.album.images[0]?.url || "/placeholder.png",
                });

                const colors = await res2.json();

                setBackground(colors.hex);
                setForeground(colors.oppositeHex);
            }
        } else {
            setID("NONE");
            setName("");
            setAlbum("");
            setArtists([]);
            setArtistImages([]);
            setPodcast("");
            setImage("/placeholder.png");
            setIsPlaying(false);
            setProgressMS(0);
            setDurationMS(0);
            setIsPlaylist(false);
            setPlaylistName("");
            setPlaylistImage("");
            setPlaylistAuthor("");
            setPlaylistDescription("");
        }
    };

    useEffect(() => {
        fetchPlaying();
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch("/api/progress");
            const data = await res.json();
            setProgressMS(data.progress_ms);
            setDurationMS(data.duration_ms);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // song changed
        fetchPlaying();
    }, [durationMS + name]);

    return (
        <>
            <Head>
                <title>wiskatron</title>
                <meta name="description" content="wiskatron" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${inter.className}`}>
                <div
                    className={styles.screen}
                    style={{
                        color: foreground,
                        backgroundColor: background,
                    }}
                >
                    {isPlaying ? (
                        <div className={styles.content}>
                            <div
                                className={styles.mainPanel}
                                style={{
                                    borderRight: `0px solid ${foreground}`,
                                }}
                            >
                                <img
                                    className={styles.coverArt}
                                    src={image}
                                    alt=""
                                ></img>
                            </div>
                            <div className={styles.sidePanel}>
                                <div className={styles.metadata}>
                                    <h1 className={styles.trackName}>{name}</h1>
                                    <h1 className={styles.artistName}>
                                        {podcast || artists?.join(", ")}
                                    </h1>
                                    <h1 className={styles.albumName}>
                                        {album}
                                    </h1>
                                </div>
                                {isPlaylist ? (
                                    <div className={styles.playlist}>
                                        {/* <p>playlist:</p> */}
                                        <img
                                            className={styles.playlistImage}
                                            src={playlistImage}
                                        ></img>
                                        <h1 className={styles.playlistName}>
                                            {playlistName}
                                        </h1>
                                        <h1 className={styles.playlistAuthor}>
                                            {playlistAuthor}
                                        </h1>
                                        {/* <h1
                                            className={
                                                styles.playlistDescription
                                            }
                                        >
                                            {playlistDescription}
                                        </h1> */}
                                    </div>
                                ) : (
                                    ""
                                )}

                                {/* <div className={styles.artists}>
                                    {artistImages.map((img, i) => (
                                        <div className={styles.artist}>
                                            <img src={img} key={img}></img>
                                        </div>
                                    ))}
                                </div> */}
                            </div>
                            <div
                                className={styles.progress}
                                style={{
                                    borderTop: `1px solid ${foreground}`,
                                }}
                            >
                                <h3
                                    className={styles.timestamp}
                                    style={{ textAlign: "right" }}
                                >
                                    {formatMSToMins(progressMS)}
                                </h3>
                                <ProgressBar
                                    value={progressMS || 0}
                                    max={durationMS || 1}
                                    color={foreground}
                                />
                                <h3
                                    className={styles.timestamp}
                                    style={{ textAlign: "left" }}
                                >
                                    {formatMSToMins(durationMS)}
                                </h3>
                            </div>
                        </div>
                    ) : (
                        <h1>nothing is playing</h1>
                    )}
                </div>
            </main>
        </>
    );
}
