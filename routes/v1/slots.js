import { Router } from "express";
import { database } from "./../../index";
import { generate_id, sendBookEmail } from "./../../helpers/helpers";

const router = Router();

router.get("/:seller_id", (request, response) => {
  const collection = database.collection("Slots"),
    seller_id = request.params.seller_id;
  // get seller slots
  collection.find({ seller_id }).toArray((error, result) => {
    if (error) {
      return response.status(500).send(error);
    }
    let booked_slots = [];
    result.map(slot => {
      booked_slots.push({
        slot_time: slot.slot_time,
        email: slot.email
      });
    });
    response.send({ status: 200, data: booked_slots });
  });
});

router.post("/book", (request, response) => {
  collection = database.collection("Slots");
  const slot_info = request.body.slot || {
    seller_id: "vyOORmHdYCYKZS2n6",
    slot_time: "Fri, 06 Mar 2020 18:53:33 GMT",
    email: "quraanmaram@gmail.com",
    status: "requested"
  };
  slot_info["_id"] = generate_id();
  collection.insert(slot_info, (error, result) => {
    if (error) {
      return response.status(500).send({
        status: 500,
        message: "something went wrong, please try again!"
      });
    }
    sendBookEmail(slot_info.email, slot_info.slot_time);
    response.send({ status: 200, message: "Slot is booked successfully!" });
  });
});

export default router;
