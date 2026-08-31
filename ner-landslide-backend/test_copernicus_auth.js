require("dotenv").config();

const axios = require("axios");


const testCopernicusAuth = async () => {
    try {
        const response = await axios.post(
            "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id:
                    process.env.COPERNICUS_CLIENT_ID,
                client_secret:
                    process.env.COPERNICUS_CLIENT_SECRET
            }),
            {
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                }
            }
        );

        if (!response.data.access_token) {
            throw new Error(
                "Access token not received"
            );
        }

        console.log(
            "Copernicus authentication successful!"
        );

        console.log(
            "Token received:",
            "YES"
        );

        console.log(
            "Expires in:",
            response.data.expires_in,
            "seconds"
        );

    } catch (error) {
        console.error(
            "Authentication failed:"
        );

        console.error(
            error.response?.data ||
            error.message
        );
    }
};


testCopernicusAuth();