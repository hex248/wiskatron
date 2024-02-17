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

type PlaybackInfo = {
    name: string;
    album: string;
    artists?: string[];
    artistImages?: string[];
    podcast?: string;
    image: string;
    is_playing: boolean;
    progress_ms: number;
    duration_ms: number;
};

export default function Home() {
    const [info, setInfo] = useState<PlaybackInfo>({
        name: "",
        album: "",
        image: "/placeholder.png",
        is_playing: false,
        progress_ms: 0,
        duration_ms: 0,
    });

    const [background, setBackground] = useState("#000000");
    const [foreground, setForeground] = useState("#ffffff");

    const formatName = (name: string) => {
        let newName = name;
        newName = newName.split(" (with")[0];
        newName = newName.split(" (feat")[0];
        newName = newName.split(" (ft")[0];
        return newName;
    };

    const fetchPlaying = () => {
        fetch("/api/playing")
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "No content") {
                    return setInfo({
                        name: "",
                        album: "",
                        image: "/placeholder.png",
                        is_playing: false,
                        progress_ms: 0,
                        duration_ms: 0,
                    });
                }

                if (data.item?.is_local) {
                    setInfo({
                        name: formatName(data.item.name),
                        album: data.item.album.name,
                        artists: data.item.artists?.map((a: Artist) => a.name),
                        artistImages: data.item.artistImages,
                        image: "/placeholder.png",
                        is_playing: data.is_playing,
                        progress_ms: data.progress_ms,
                        duration_ms: data.item.duration_ms,
                    });
                } else {
                    setInfo({
                        name: formatName(data.item.name),
                        album: data.item.album?.name || "",
                        artists: data.item.artists?.map((a: Artist) => a.name),
                        artistImages: data.item.artistImages,
                        podcast:
                            data.item.type === "episode"
                                ? data.item.show.name
                                : "",
                        image:
                            data.item.album?.images[0].url ||
                            data.item.images[0].url,
                        is_playing: data.is_playing,
                        progress_ms: data.progress_ms,
                        duration_ms: data.item.duration_ms,
                    });
                }
            });
    };

    const pollingRate = 1;

    let timer = setInterval(() => {}, 1000000000);
    useEffect(() => {
        clearInterval(timer);
        fetchPlaying();
        timer = setInterval(() => {
            fetchPlaying();
        }, pollingRate * 1000);
    }, []);

    useEffect(() => {
        // update background colour to match album art
        if (info?.image === "/placeholder.png") return;
        else if (info?.image == "") {
            setBackground("#c7c7c7");
            setForeground("#ffffff");
        } else {
            fetch("/api/colorFromImage", { method: "POST", body: info?.image })
                .then((res) => res.json())
                .then((data) => {
                    setBackground(data.hex);
                    setForeground(data.oppositeHex);
                });
        }
    }, [info?.image]);

    return (
        <>
            <Head>
                <title>wiskatronn </title>
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
                    {info ? (
                        <div className={styles.content}>
                            <div
                                className={styles.mainPanel}
                                style={{
                                    borderRight: `0px solid ${foreground}`,
                                }}
                            >
                                <div className={styles.artistImages}>
                                    {info?.artistImages?.map((image) => (
                                        <img
                                            src={image}
                                            key={image}
                                            className={styles.artistImage}
                                        ></img>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.sidePanel}>
                                <img
                                    className={styles.coverArt}
                                    src={info?.image}
                                    alt=""
                                ></img>
                                <div className={styles.metadata}>
                                    <h1 className={styles.trackName}>
                                        {info?.name}
                                    </h1>
                                    <h1 className={styles.artistName}>
                                        {info?.podcast ||
                                            info?.artists?.join(", ")}
                                    </h1>
                                    <h1 className={styles.albumName}>
                                        {info?.album}
                                    </h1>
                                </div>
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
                                    {formatMSToMins(info?.progress_ms)}
                                </h3>
                                <ProgressBar
                                    value={info?.progress_ms || 0}
                                    max={info?.duration_ms || 1}
                                    color={foreground}
                                />
                                <h3
                                    className={styles.timestamp}
                                    style={{ textAlign: "left" }}
                                >
                                    {formatMSToMins(info?.duration_ms)}
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
