require("dotenv").config();

const {
    Pool
} = require(
    "pg"
);


const pool =
    new Pool({

        host:
            process.env.POSTGRES_HOST ||
            "localhost",

        port:
            process.env.POSTGRES_PORT ||
            5432,

        user:
            process.env.POSTGRES_USER ||
            "postgres",

        password:
            process.env.POSTGRES_PASSWORD,

        database:
            process.env.POSTGRES_DB ||
            "ner_landslide"
    });


pool.on(
    "error",
    (
        error
    ) => {

        console.error(
            "PostgreSQL unexpected error:",
            error
        );
    }
);


module.exports =
    pool;