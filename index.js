import express from 'express';
import parser from 'body-parser';
import bodyParser from "body-parser";
import { generate_id, sendBookEmail } from './helpers/helpers';

const MongoClient = require("mongodb").MongoClient;

const connection_url = "mongodb+srv://dbUser:dbUserPassword@cluster0-x8epq.mongodb.net/test?retryWrites=true&w=majority";

const db_name = "data";

const app = new express();

app.use(parser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Welcome to Tazweed API");
});


var database, collection;

app.listen(8080, () => {
    MongoClient.connect(connection_url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(db_name);
        console.log("Connected to `" + db_name + "`!");
    });
});

app.get("/sellers", (request, response) => {
    collection = database.collection("Sellers");
    // get sellers info with available slots >= today
    collection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ status: 200, data: result });
    });
});

app.post("/sellers/add", (request, response) => {
    collection = database.collection("Sellers");
    const seller = { _id: generate_id(), available_slots: [new Date().toGMTString(), "Mon, 09 Mar 2020 18:50 GMT", "Mon, 09 Mar 2020 17:00 GMT"], created_at: new Date(), name: "Issa" };
    collection.insert(seller, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ status: 200, message: "seller is added successfully!" });
    });
});

app.post("/sellers/:id/slots/add", (request, response) => {
    collection = database.collection("Sellers");
    const seller_id = request.params.id;
    const slot = request.body.slot || "Tue, 10 Mar 2020 18:00 GMT";
    collection.updateOne({ _id: seller_id }, { $push: { available_slots: slot } }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ status: 200, message: "Slot is added successfully!" });
    });
});

app.post("/slot/book", (request, response) => {
    collection = database.collection("Slots");
    const slot_info = request.body.slot || { seller_id: "vyOORmHdYCYKZS2n6", slot_time: "Fri, 06 Mar 2020 18:53:33 GMT", email: "quraanmaram@gmail.com" };
    slot_info["_id"] = generate_id();
    collection.insert(slot_info, (error, result) => {
        if (error) {
            return response.status(500).send({ status: 500, message: "something went wrong, please try again!" });
        }
        console.log("result", result);

        // sendBookEmail(slot_info.email);
        response.send({ status: 200, message: "Slot is booked successfully!" });
    });
});


console.log("Server running at PORT " + (process.env.PORT || 8080));
