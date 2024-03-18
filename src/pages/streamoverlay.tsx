import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/StreamOverlay.module.css";
import FadeImages from "@/components/fadeimages";

const inter = Inter({ subsets: ["latin"] });

import { useState, useEffect } from "react";
import { Artist } from "../lib/spotify";

export default function StreamOverlay() {
    const [name, setName] = useState("");
    const [artists, setArtists] = useState<string[]>([]);
    const [podcast, setPodcast] = useState("");
    const [image, setImage] = useState("/placeholder.png");
    const [isPlaying, setIsPlaying] = useState(false);
    const [durationMS, setDurationMS] = useState(0);

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
            setName(formatName(item.name));
            setArtists(item.artists?.map((a: Artist) => a.name));
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
            setDurationMS(item.duration_ms);

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
            setName("");
            setArtists([]);
            setPodcast("");
            setImage("/placeholder.png");
            setIsPlaying(false);
            setDurationMS(0);
        }
    };

    useEffect(() => {
        fetchPlaying();
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch("/api/progress");
            const data = await res.json();
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
                <title>spotify activity</title>
                <meta name="description" content="spotify activity" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${inter.className}`}>
                <div className={styles.screen}>
                    {isPlaying ? (
                        <div
                            className={styles.content}
                            style={{
                                color: foreground,
                                backgroundColor: background,
                            }}
                        >
                            <div className={styles.coverArtContainer}>
                                <FadeImages
                                    imageURL={image}
                                    className={styles.coverArt}
                                />
                            </div>
                            <div className={styles.metadata}>
                                <h1 className={styles.trackName}>{name}</h1>
                                <h1 className={styles.artistName}>
                                    {podcast || artists?.join(", ")}
                                </h1>
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
