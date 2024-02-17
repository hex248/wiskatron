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
    let path = req.body;
    if (!path.startsWith("https")) path = "public" + req.body;

    getPixels(path, (err: any, pixels: any) => {
        if (err || pixels == undefined) {
            res.send({ hex: "#000000", oppositeHex: "#ffffff" });
            return;
        }
        const data = [...pixels.data];
        const width = Math.round(Math.sqrt(data.length / 4));
        const height = width;
        extractColors({ data, width, height })
            .then((colors: any) => {
                let originalColors = colors;
                colors = colors.filter(
                    (c: any) => (c.lightness || 0) < 0.9 && (c.area || 1) > 0.2
                );
                colors = colors.sort((a: any, b: any) => {
                    if (
                        b.saturation > a.saturation &&
                        b.lightness - 0.5 > a.lightness
                    )
                        return 1;
                    if (
                        b.saturation < a.saturation &&
                        b.lightness < a.lightness - 0.5
                    )
                        return -1;
                    if (b.saturation > a.saturation) return 1;
                    if (b.lightness - 0.5 > a.lightness) return 1;
                });
                colors = colors.sort((a: any, b: any) => b.area * 1.5 - a.area);
                originalColors = originalColors.sort(
                    (a: any, b: any) => b.area - a.area
                );
                if (colors.length === 0) colors.push(originalColors[0]);

                let constrastHSL = contrast(
                    colors[0].hue * 360,
                    colors[0].saturation * 100,
                    colors[0].lightness * 100
                );

                colors[0].oppositeHex = convertToHexFromHSL(
                    constrastHSL.h,
                    constrastHSL.s,
                    constrastHSL.l
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

const convertToHexFromHSL = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0"); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

const contrast = (h: number, s: number, l: number) => {
    let oppositeHue = (h + 180) % 360;
    let oppositeLightness = l < 50 ? l + 50 : l - 50;
    return { h: h, s: s, l: oppositeLightness };
};
