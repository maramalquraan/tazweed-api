import { Router } from "express";
import { database } from "./../../index";
import {
  generate_id,
  generateToken,
  login_validation,
  comparePassword
} from "./../../helpers/helpers";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

const router = Router();

router.get("/", (request, response) => {
  const collection = database.collection("Sellers");
  // get sellers info with available slots >= today
  collection
    .find({})
    .sort({ created_at: -1 })
    .toArray((error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      response.send({ status: 200, data: result });
    });
});

router.get("/:seller_id", (request, response) => {
  const collection = database.collection("Sellers"),
    seller_id = request.params.seller_id;
  collection.find({ _id: seller_id }).toArray((error, result) => {
    if (error) {
      return response.status(404).send({
        status: 404,
        message: "unauthorized"
      });
    }
    response.status(200).send({
      status: 200,
      seller: result[0]
    });
  });
});

router.post("/signup", login_validation, async (req, res) => {
  const collection = database.collection("Sellers");
  try {
    // validate Signup
    validationResult(req).throw();

    // check if the email is already exist
    let { email, password, name } = req.body;
    email = (email + "").toLowerCase();

    if (!password || password.length < 6)
      throw Error({
        status: 400,
        message: "Password length should be 6 or more characters"
      });

    const existed = await collection.findOne({ email });
    if (existed) {
      return res.status(400).json({
        status: 400,
        message: "Email Already Exists! Login or choose another email."
      });
    }

    const hash = await bcrypt.hash(password, 1);

    const seller = {
      _id: generate_id(),
      password: hash,
      name,
      email,
      created_at: new Date()
    };
    const token = generateToken(seller);

    await collection.insertOne(seller, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      return res.status(200).send({
        status: 200,
        message: "seller account is added successfully!",
        token,
        seller
      });
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: "Email and/or Password are not valid"
    });
  }
});

router.post("/login", login_validation, async (req, res) => {
  try {
    const collection = database.collection("Sellers");
    validationResult(req).throw();
    let { email, password } = req.body;
    email = (email + "").toLowerCase();
    const seller = await collection.findOne({ email });

    if (!seller)
      res.status(400).send({
        status: 400,
        message: "Email and/or Password are not correct"
      });

    const isPassMatch = await comparePassword(password, seller);

    if (isPassMatch) {
      const token = generateToken(seller);
      res.status(200).send({
        status: 200,
        message: "Logged In Successfully",
        token,
        seller
      });
    } else
      res.status(400).send({
        status: 400,
        message: "Email and/or Password are not correct"
      });
  } catch (err) {
    res
      .status(400)
      .send({ status: 400, message: "Email and/or Password are not correct" });
  }
});

router.post("/:id/slots/add", async (request, response) => {
  const collection = database.collection("Sellers"),
    seller_id = request.params.id,
    slot_time = request.body.slot_time;
  collection.updateOne(
    { _id: seller_id },
    { $push: { available_slots: { $each: [slot_time], $sort: -1 } } },
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
          response.send({
            status: 200,
            data: result,
            message: "Slot Time is added successfully!"
          });
        });
    }
  );
});

export default router;
