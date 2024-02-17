const fastify = require("fastify")();
const oauthPlugin = require("@fastify/oauth2");

const dotenv = require("dotenv");
dotenv.config();

const config = {
    access_token: "",
    refresh_token: "",
};

const startFastify = () => {
    fastify.register(oauthPlugin, {
        name: "Spotify",
        scope: ["user-read-currently-playing"],
        credentials: {
            client: {
                id: process.env.SPOTIFY_CLIENT_ID,
                secret: process.env.SPOTIFY_CLIENT_SECRET,
            },
            auth: oauthPlugin.SPOTIFY_CONFIGURATION,
        },
        startRedirectPath: "/login/spotify",
        callbackUri: `http://localhost:${process.env.PORT}/login/spotify/callback`,
    });

    fastify.get("/login/spotify/callback", async (req, reply) => {
        const result =
            await fastify.Spotify.getAccessTokenFromAuthorizationCodeFlow(req);

        console.log("The Spotify token is %o", result.token);
        config.access_token = result.token.access_token;
        config.refresh_token = result.token.refresh_token;
        let refreshTimeout = result.token.expires_in;
        console.log("Refreshing in " + refreshTimeout + " seconds");
        setInterval(async () => {
            console.log("GETTING NEW ACCESS TOKEN WITH REFRESH");
            const result =
                await fastify.Spotify.getNewAccessTokenUsingRefreshToken(
                    config
                );
            config.access_token = result.token.access_token;
            console.log("NEW TOKEN:");
            console.log(config);
            console.log("Refreshing in " + refreshTimeout + " seconds");
        }, refreshTimeout * 1000);

        reply.send(config.refresh_token);
        // reply.redirect(process.env.SPOTIFY_CALLBACK_URI);
    });

    fastify.listen({ port: 3005 }, () => {
        console.log("Server listening at http://localhost:3005/login/spotify");
    });
};

startFastify();

module.exports = {
    startFastify,
    config,
};
