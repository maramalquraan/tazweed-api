import express from 'express';
import apiRoutes from "./routes/index.js";

const MongoClient = require("mongodb").MongoClient;

const connection_url = "mongodb+srv://dbUser:dbUserPassword@cluster0-x8epq.mongodb.net/test?retryWrites=true&w=majority";

const db_name = "data";

const app = new express();

app.get('/', (req, res) => {
    res.send("Welcome to Tazweed API");
});

app.use("/", apiRoutes);

export var database;

app.listen(8080, () => {
    MongoClient.connect(connection_url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(db_name);
        console.log("Connected to `" + db_name + "`!");
    });
});


console.log("Server running at PORT " + (process.env.PORT || 8080));
