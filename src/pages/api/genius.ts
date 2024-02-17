import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "@/lib/genius";
import type { GeniusData } from "@/lib/genius";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GeniusData>
) {
    getData(req.body)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((error) => {
            console.log(error);
            res.send({ message: "error" });
        });
}
