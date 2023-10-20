import { createRequire } from "module";
import { decodeProductOpaqueId } from "../xforms/id.js";
import ReactionError from "@reactioncommerce/reaction-error";
const require = createRequire(import.meta.url);
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

export default async function stripeOneTimePayment(context, input) {
  // inputSchema.validate(input);

  const { appEvents, collections, simpleSchemas } = context;
  const { Product } = simpleSchemas;
  const { Products, Quotes, Vehicles } = collections;
  //const { product: productInput, shopId, shouldCreateFirstVariant = true } = input;
  const { quoteId } = input;

  console.log("process env is ", process.env.STRIPE_SUCCESS_URL);
  console.log("process env is ", process.env.STRIPE_API_KEY);
  //console.log("condition ", !price || !quoteId.length);

  if (!quoteId) {
    console.log("here in this");
    throw new ReactionError("invalid-parameter", "Please provide quoteId");
  }

  let qId = quoteId + "==";

  let decodedQuoteid = decodeProductOpaqueId(qId);
  console.log("Decoded quoteId is ", decodedQuoteid);

  let findQuote = await Quotes.findOne({
    _id: decodedQuoteid,
  });
  console.log("typeof ", typeof findQuote?.discountedPrice);
  console.log("Found Quote is ", findQuote);
  console.log("price data is ", findQuote?.discountedPrice * 100);
  const unitAmountInCents = Math.round(unitAmount * 100);

  if (findQuote && findQuote?.discountedPrice) {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Stripe payment",
            },
            unit_amount: findQuote?.discountedPrice * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: "automatic",
        metadata: {
          decodedQuoteid,
          data: "hello",
        },
      },
      mode: "payment",
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_FAILURE_URL,
    });

    console.log("Session is ", session);

    let cId = session.id;
    let stripeCheckoutUrl = session.url;

    let obj = {
      checkoutSessionId: cId,
    };

    let updatedQuote = await Quotes.findOneAndUpdate(
      { _id: decodedQuoteid },
      { $set: obj },
      { new: true }
    );

    console.log("Updated Quote is ", updatedQuote);

    return {
      start: "in stripe",
      url: stripeCheckoutUrl,
      stripeJson: JSON.stringify(session),
      // stripeJson: session,
    };
  } else {
    throw new ReactionError("not-found", "Quote record not found");
  }
}
