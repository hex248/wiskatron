import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import ProgressBar from "@/components/progressbar";
import FadeImages from "@/components/fadeimages";

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
        if (!name) return name;
        let newName = name;
        const thingsToRemove = [
            " \\(with",
            " \\(feat",
            " \\(from",
            " \\(ft",
            " \\[with",
            " \\[feat",
            " \\[from",
            " \\[ft",
        ];
        for (let thing of thingsToRemove) {
            let regex = new RegExp(thing, "i");
            newName = newName.split(regex)[0];
        }
        return newName;
    };

    const fetchPlaying = async () => {
        const res = await fetch(`/api/playing`);
        const data = await res.json();
        if (data.item) {
            let item = data.item;
            setID(item.id);
            setName(formatName(item.name));
            setAlbum(formatName(item.album?.name));
            setArtists(item.artists?.map((a: Artist) => a.name));
            setArtistImages(item.artistImages || []);
            setPodcast(item.type === "episode" ? item.show.name : "");
            let image = "/placeholder.png";
            if (item.album?.images.length > 0) {
                image = item.album?.images[0]?.url;
            }
            if (item.images) {
                image = item.images[0]?.url;
            }
            setImage(image);

            setIsPlaying(data.is_playing);
            setProgressMS(data.progress_ms);
            setDurationMS(item.duration_ms);
            setIsPlaylist(data.isPlaylist);
            setPlaylistName(data.playlistName);
            setPlaylistImage(data.playlistImage);
            setPlaylistAuthor(data.playlistAuthor);
            setPlaylistDescription(data.playlistDescription);

            if (image !== "/placeholder.png") {
                const res2 = await fetch("/api/colorFromImage", {
                    method: "POST",
                    body: image,
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
                                <FadeImages
                                    imageURL={image}
                                    className={styles.coverArt}
                                />
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
                                    <div
                                        className={styles.playlist}
                                        // style={{
                                        //     backgroundColor: `${foreground}`,
                                        //     color: `${background}`,
                                        // }}
                                        style={{
                                            // border: `2px solid ${foreground}`,
                                            backgroundColor: `${foreground}69`,
                                            color: `${background}`,
                                        }}
                                    >
                                        {/* <p>playlist:</p> */}
                                        <FadeImages
                                            imageURL={playlistImage}
                                            className={styles.playlistImage}
                                        />
                                        <div>
                                            <h1 className={styles.playlistName}>
                                                {playlistName}
                                            </h1>
                                            <h1
                                                className={
                                                    styles.playlistAuthor
                                                }
                                            >
                                                {playlistAuthor}
                                            </h1>
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
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
