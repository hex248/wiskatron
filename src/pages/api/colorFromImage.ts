import type { NextApiRequest, NextApiResponse } from "next";
const getPixels = require("get-pixels");
const { extractColors } = require("extract-colors");

type Color = {
    hex: string;
    oppositeHex: string;
    red?: number;
    green?: number;
    blue?: number;
    area?: number;
    hue?: number;
    saturation?: number;
    lightness?: number;
    intensity?: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Color>
) {
    if (!req.body.startsWith("https")) {
        console.log(1);
        return res.send({ hex: "#000000", oppositeHex: "#ffffff" });
    }
    console.log(2);
    // const threshold = 50;
    // getAverageColor(req.body, {
    //     ignoredColor: [
    //         [223, 194, 141, 255, threshold],
    //         [71, 62, 45, 255, threshold],
    //     ],
    // })
    //     .then((color) => {
    //         console.log(color);
    //         res.send(color);
    //     })
    //     .catch((e) => {
    //         res.send({ hex: "#000000" });
    //     });

    getPixels(req.body, (err: any, pixels: any) => {
        if (err) {
            res.send({ hex: "#000000", oppositeHex: "#ffffff" });
            return;
        }
        const data = [...pixels.data];
        const width = Math.round(Math.sqrt(data.length / 4));
        const height = width;
        extractColors({ data, width, height })
            .then((colors: Color[]) => {
                colors = colors.filter(
                    (c) => (c.lightness || 0) < 0.9 && (c.area || 1) > 0.2
                );
                colors = colors.sort(
                    (a, b) => (b.saturation || 0) - (a.saturation || 0)
                );

                res.send(
                    colors[0] || { hex: "#000000", oppositeHex: "#ffffff" }
                );
            })
            .catch((err: any) => {
                console.log(err);
                res.send({ hex: "#000000", oppositeHex: "#ffffff" });
                return;
            });
    });
}
