const express = require("express");
const app = express();
const { AuthorizationCode } = require("simple-oauth2");

const config = {
    GENIUS_HOST: "https://api.genius.com",
    GENIUS_CLIENT_ID:
        "q2Uc9LKnFFwnCg17rVgIhW7xYLQVkqwpSGW_unRjJ5uTxf8yuKbzXS3HXIwLBj9t",
    GENIUS_CLIENT_SECRET:
        "f3N5dImdnDBx0uvDkRQ8M7a4XkQ8FIaDW0Uwk-PNEPpfvy9pkCjDSVZN5z--SFHGFYElihwau8F6JAolr1ItiA",
    GENIUS_CLIENT_ACCESS_TOKEN:
        "tg6VWxNve6VvVGQDFYGY3cHn6Gq7sr7gRVmB58ruQbqrFYmTnALRS-hMIo43ln8_",
    port: 666,
};

const URL = `http://localhost:${config.port}`;

const client = new AuthorizationCode({
    client: {
        id: config.GENIUS_CLIENT_ID,
        secret: config.GENIUS_CLIENT_SECRET,
    },
    auth: {
        tokenHost: config.GENIUS_HOST,
        tokenPath: "/oauth/token",
        authorizePath: "/oauth/authorize",
    },
});

const authorizationURL = client.authorizeURL({
    redirect_uri: `${URL}/auth/callback`,
});

app.get("/auth", (req, res) => {
    res.redirect(authorizationURL);
});

app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;

    const options = {
        code: code,
        redirect_uri: `${URL}/auth/callback`,
    };

    const { token } = await client.getToken(options);

    res.status(200).json(token.access_token);
});

app.get("/search", async (req, res) => {
    const search = req.query.s;

    const searchURL = `https://api.genius.com/search?q=${search}`;

    const response = await fetch(searchURL, {
        headers: {
            Authorization: `Bearer ${config.GENIUS_CLIENT_ACCESS_TOKEN}`,
        },
    });

    const data = await response.json();

    res.status(200).json(data);
});

app.listen(config.port, () => {
    console.log(`Server listening at ${URL}`);
});
