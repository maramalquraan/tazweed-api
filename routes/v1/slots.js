import { Router, request } from "express";
import { database } from "./../../index";
import {
  generate_id,
  sendBookEmail,
  sendApprovalEmail,
  sendRejectlEmail,
  validateEmail
} from "./../../helpers/helpers";

const router = Router();

router.get("/:seller_id", (request, response) => {
  const collection = database.collection("Slots"),
    seller_id = request.params.seller_id;
  // get seller slots
  collection
    .find({ seller_id })
    .sort({ created_at: -1 })
    .toArray((error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      response.send({ status: 200, data: result });
    });
});

router.post("/book", (request, response) => {
  const collection = database.collection("Slots");
  const slot_info = request.body.slot;
  if (!slot_info.email || !validateEmail(slot_info.email)) {
    return response.status(400).send({
      status: 400,
      message: "Email is not valid!"
    });
  }
  slot_info["_id"] = generate_id();
  slot_info["status"] = "pending";
  slot_info["created_at"] = new Date();
  collection.insertOne(slot_info, (error, result) => {
    if (error) {
      return response.status(500).send({
        status: 500,
        message: "something went wrong, please try again!"
      });
    }
    const seller_db = database.collection("Sellers");
    seller_db.updateOne(
      { _id: slot_info.seller_id },
      { $pull: { available_slots: { $in: [slot_info.slot_time] } } },
      (error, result) => {
        if (error) {
          console.log(
            "Error happened while updating seller doc/pop the booked time"
          );
          return response.status(500).send({
            status: 500,
            message: "something went wrong, please try again!"
          });
        }
        sendBookEmail(slot_info.email, slot_info.slot_time);
        response.send({ status: 200, message: "Slot is booked successfully!" });
      }
    );
  });
});

router.put("/approve/:slot_id", async (request, response) => {
  const collection = database.collection("Slots"),
    slot_info = request.body,
    slot_id = request.params.slot_id;
  collection.updateOne(
    { _id: slot_id },
    { $set: { status: "approved" } },
    (error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      collection
        .find({})
        .sort({ created_at: -1 })
        .toArray((error, result) => {
          if (error) {
            return response.status(500).send(error);
          }
          sendApprovalEmail(slot_info.email, slot_info.slot_time);
          collection
            .find({})
            .sort({ created_at: -1 })
            .toArray((error, result) => {
              if (error) {
                return response.status(500).send(error);
              }
              response.send({
                status: 200,
                data: result,
                message: "Slot is approved!"
              });
            });
        });
    }
  );
});

router.put("/reject/:slot_id", async (request, response) => {
  const collection = database.collection("Slots"),
    slot_info = request.body,
    slot_id = request.params.slot_id;
  collection.updateOne(
    { _id: slot_id },
    { $set: { status: "rejected" } },
    (error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      collection
        .find({})
        .sort({ created_at: -1 })
        .toArray((error, result) => {
          if (error) {
            return response.status(500).send(error);
          }
          sendRejectlEmail(slot_info.email, slot_info.slot_time);
          collection
            .find({})
            .sort({ created_at: -1 })
            .toArray((error, result) => {
              if (error) {
                return response.status(500).send(error);
              }
              response.send({
                status: 200,
                data: result,
                message: "Slot is rejected!"
              });
            });
        });
    }
  );
});

export default router;
