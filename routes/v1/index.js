import { Router } from "express";
import bodyParser from "body-parser";

const router = Router();

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


import sellersRoutes from "./sellers";
router.use("/sellers", sellersRoutes);

import slotsRoutes from "./slots";
router.use("/slots", slotsRoutes);



export default router;
