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
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
};

type PlaybackInfo = {
    name: string;
    artists?: string[];
    podcast?: string;
    image: string;
    is_playing: boolean;
    progress_ms: number;
    duration_ms: number;
};

export default function Home() {
    const [info, setInfo] = useState<PlaybackInfo>();

    const [background, setBackground] = useState("#000000");
    const [foreground, setForeground] = useState("#ffffff");

    const fetchPlaying = () => {
        console.log("fetching playing data");
        fetch("/api/playing")
            .then((res) => res.json())
            .then((data) => {
                if (data.item?.is_local) {
                    setInfo({
                        name: data.item.name,
                        artists: data.item.artists?.map((a: Artist) => a.name),
                        image: "/placeholder.png",
                        is_playing: data.is_playing,
                        progress_ms: data.progress_ms,
                        duration_ms: data.item.duration_ms,
                    });
                } else {
                    setInfo({
                        name: data.item.name,
                        artists: data.item.artists?.map((a: Artist) => a.name),
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
        fetch("/api/colorFromImage", { method: "POST", body: info?.image })
            .then((res) => res.json())
            .then((data) => {
                document.body.style.backgroundColor = data.hex;
                document.body.style.color = data.oppositeHex;
                setBackground(data.hex);
                setForeground(data.oppositeHex);
            });
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
            <main className={`${styles.main} ${inter.className}`}>
                <Image
                    className={styles.coverArt}
                    src={info?.image || ""}
                    alt=""
                    width={750}
                    height={750}
                ></Image>
                <div className={styles.progress}>
                    {formatMSToMins(info?.progress_ms)}
                    <ProgressBar
                        value={info?.progress_ms || 0}
                        max={info?.duration_ms || 1}
                        color={foreground}
                        width={750}
                        height={7.5}
                    />
                    {formatMSToMins(info?.duration_ms)}
                </div>
                <h1>
                    {info?.name} - {info?.podcast || info?.artists?.join(", ")}
                </h1>
            </main>
        </>
    );
}
