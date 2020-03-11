import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { database } from "./../index";

const secret = "tazweed";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
};

const strategy = new Strategy(options, function(payload, next) {
  const collection = database.collection("Sellers");
  console.log("coll", collection);

  collection.findOne({ _id: payload._id }, next);
});

passport.use(strategy);

export { secret };
export const auth = passport.authenticate("jwt", { session: false });
