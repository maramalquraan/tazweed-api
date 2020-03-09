import { Router } from 'express';
import {database} from './../../index';
import { generate_id } from './../../helpers/helpers';


const router = Router();


router.get("/", (request, response) => {    
    const collection = database.collection("Sellers");
    // get sellers info with available slots >= today
    collection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ status: 200, data: result });
    });
});


router.post("/add", (request, response) => {
    const collection = database.collection("Sellers");
    const seller = { _id: generate_id(), available_slots: [new Date().toGMTString(), "Mon, 09 Mar 2020 18:50 GMT", "Mon, 09 Mar 2020 17:00 GMT"], created_at: new Date(), name: "Issa" };
    collection.insert(seller, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ status: 200, message: "seller is added successfully!" });
    });
});

router.post("/:id/slots/add", (request, response) => {
    const collection = database.collection("Sellers");
    const seller_id = request.params.id;
    const slot = request.body.slot || "Tue, 10 Mar 2020 18:00 GMT";
    collection.updateOne({ _id: seller_id }, { $push: { available_slots: slot } }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send({ status: 200, message: "Slot is added successfully!" });
    });
});

export default router;
