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
