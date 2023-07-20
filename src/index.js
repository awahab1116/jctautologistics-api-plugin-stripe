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

  if (app.expressApp) {
    // enable files upload

    //add other middleware
    app.expressApp.use(cors());
    app.expressApp.use(bodyParser.json());
    app.expressApp.use(bodyParser.urlencoded({ extended: true }));
    app.expressApp.use(morgan("dev"));
    app.expressApp.post("/stripe", async (req, res) => {
      console.log("In stripe req.body", req.body);
      console.log("stripe event type is ", req.body.type);

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
