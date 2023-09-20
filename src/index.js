import { createRequire } from "module";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
const require = createRequire(import.meta.url);
const pkg = require("../package.json");
import mutations from "./mutations/index.js";
// import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

var _context = null;

function myStartupStripe(context) {
  _context = context;
  const { app, collections, rootUrl } = context;
  const { Products, Quotes, Vehicles } = collections;
  if (app.expressApp) {
    // enable files upload

    //add other middleware
    app.expressApp.use(cors());
    app.expressApp.use(bodyParser.json());
    app.expressApp.use(bodyParser.urlencoded({ extended: true }));
    app.expressApp.use(morgan("dev"));
    app.expressApp.post("/stripe", async (req, res) => {
      // console.log("In stripe req.body", req.body);
      console.log("stripe event type is ", req.body.type);
      if (req.body.type === "checkout.session.completed") {
        console.log("in check ", req.body);
        console.log(
          "paymentIntent Id is ",
          req?.body?.data?.object?.payment_intent
        );
        //find checkout session
        let cId = req?.body?.data?.object?.id;
        let pId = req?.body?.data?.object?.payment_intent;
        console.log("checkout id is ", cId);
        if (cId) {
          console.log("hello ");
          let quote = await Quotes.findOne({
            checkoutSessionId: cId,
          });

          if (quote) {
            let obj = {
              paymentStatus: true,
              paymentIntentId: pId,
            };

            let updatedQuote = await Quotes.findOneAndUpdate(
              { checkoutSessionId: cId },
              { $set: obj },
              { new: true }
            );

            console.log("updated Quote ", updatedQuote);

            let paymentStatusUpdated =
              updatedQuote?.lastErrorObject.updatedExisting;
            if (paymentStatusUpdated) {
              console.log("Quote payment status is changed to true");
            }
          }
        }
      }

      res.status(200).send({
        success: true,
      });
    });
  }
}

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: pkg.label,
    name: pkg.name,
    version: pkg.version,
    functionsByType: {
      startup: [myStartupStripe],
    },
    graphQL: {
      resolvers,
      schemas,
    },
    mutations,
  });
}
