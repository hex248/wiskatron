import type { NextApiRequest, NextApiResponse } from "next";
import type { CurrentlyPlaying } from "../../lib/spotify";
import { getCurrentlyPlaying } from "../../lib/spotify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CurrentlyPlaying>
) {
    const currentlyPlaying = await getCurrentlyPlaying();
    res.send(currentlyPlaying);
}
