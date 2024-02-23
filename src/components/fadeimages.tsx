import React, { useEffect, useState } from "react";
import Image from "next/image";

interface FadeImagesProps {
    imageURL: string;
    className: string;
}

const FadeImages = ({ imageURL, className }: FadeImagesProps) => {
    const [fade, setFade] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [loadedImage, setLoadedImage] = useState<string>(imageURL);

    useEffect(() => {
        setLoaded(false);
        setFade(true);
    }, [imageURL]);

    return (
        <div className={className}>
            {fade && (
                <Image
                    onLoad={() => {
                        setLoaded(true);
                        setTimeout(() => {
                            setLoadedImage(imageURL);
                        }, 1100);
                    }}
                    alt=""
                    src={imageURL}
                    priority
                    width={1000}
                    height={1000}
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "5px",
                        top: 0,
                        left: 0,
                        transition: "opacity 1s",
                        zIndex: 10,
                        opacity: loaded ? 1 : 0,
                    }}
                />
            )}
            {loadedImage && (
                <Image
                    onLoadingComplete={() => {
                        setFade(false);
                    }}
                    alt=""
                    src={loadedImage}
                    priority
                    width={1000}
                    height={1000}
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "5px",
                        top: 0,
                        left: 0,
                        zIndex: 0,
                    }}
                />
            )}
        </div>
    );
};

export default React.memo(FadeImages);
