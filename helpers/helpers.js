import { check } from "express-validator";
import jwt from "jsonwebtoken";
import { secret } from "./../config/passport";
import Bcrypt from "bcrypt";

export const generate_id = (len = 17) => {
  var randomId = require("random-id");
  // pattern to determin how the id will be generated
  // default is aA0 it has a chance for lowercased capitals and numbers
  var pattern = "aA0";

  return randomId(len, pattern);
};

export const sendBookEmail = async (buyer_email, time) => {
  const dotenv = require("dotenv");
  dotenv.config();
  const nodemailer = require("nodemailer"),
    password = process.env.password;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "help.tazweed@gmail.com", // please add a real email
      pass: password // please add the real email's password
    }
  });
  const options = {
    from: "help.tazweed@gmail.com", // please add a real email
    to: buyer_email || "quraanmaram@gmail.com", // please add a real email
    subject: "Book a slot",
    text: `You requested to book an appointment at ${slot_time} successfully! We will get back to as soon as possible for more information`
  };

  transporter.sendMail(options, function(error, info) {
    if (error) {
      console.log("error in sending email : ", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  return "done";
};

// User info validations
export const login_validation = [
  check("email").exists(),
  check("email").isEmail(),
  check("password").exists(),
  check("password").isLength({ min: 6 }),
  check("password").isString()
];

export const generateToken = user => {
  const _user = {
    _id: user._id,
    email: user.email
  };
  return jwt.sign(_user, secret, {
    expiresIn: "1y"
  });
};

export const regenerateToken = newPayload => {
  return jwt.sign(newPayload, secret, {
    expiresIn: "1y"
  });
};

export const comparePassword = (password, seller) => {
  if (!seller.password) throw Error("Invalid password");
  return Bcrypt.compare(password, seller.password);
};
