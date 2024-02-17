export type GeniusData = {
    message: string;
    description?: string;
    image?: string;
};

export const getData = async (searchTerm: string): Promise<GeniusData> => {
    let apiPath = await getSong(searchTerm);

    const response = await fetch(`https://api.genius.com${apiPath}`, {
        headers: {
            Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
        },
    });

    const data = await response.json();
    // console.log(data);

    let description = "";

    let children = data.response.song.description.dom.children;

    for (let i = 0; i < children.length; i++) {
        if (children[i].tag === "p") {
            for (let j = 0; j < children[i].children.length; j++) {
                if (children[i].children[j].tag === "em") {
                    description += children[i].children[j].children[0];
                } else {
                    description += children[i].children[j];
                }
            }
            description += children[i].children[0];
        }
    }

    return {
        message: "ok",
        description: description,
        image: data.response.song.song_art_image_url,
    } as GeniusData;
};

const getSong = async (searchTerm: string): Promise<string> => {
    const response = await fetch(
        `https://api.genius.com/search?q=${searchTerm}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
            },
        }
    );

    const data = await response.json();

    console.log(searchTerm);
    return data.response.hits[0].result.api_path;
};
