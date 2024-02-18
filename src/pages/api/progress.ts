import type { NextApiRequest, NextApiResponse } from "next";
import type { Progress } from "../../lib/spotify";
import { getProgress } from "../../lib/spotify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Progress>
) {
    const progress = await getProgress();
    res.send(progress);
}
