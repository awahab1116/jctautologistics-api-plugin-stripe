import { createRequire } from "module";
import ReactionError from "@reactioncommerce/reaction-error";
const require = createRequire(import.meta.url);
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

export default async function stripeOneTimePayment(context, input) {
  // inputSchema.validate(input);

  const { appEvents, collections, simpleSchemas } = context;
  const { Product } = simpleSchemas;
  const { Products, Quotes, Vehicles } = collections;
  //const { product: productInput, shopId, shouldCreateFirstVariant = true } = input;
  const { price, quoteId } = input;

  try {
    console.log("process env is ", process.env.STRIPE_SUCCESS_URL);
    console.log("in inner function stripe ", price);
    console.log("process env is ", process.env.STRIPE_API_KEY);

    let findQuote = await Quotes.findOne({
      _id: quoteId,
    });
    console.log("Found Quote is ", findQuote);
    if (findQuote) {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Stripe payment",
              },
              unit_amount: price * 100,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          capture_method: "automatic",
          metadata: {
            quoteId,
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
        { _id: quoteId },
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
    }
  } catch (err) {
    throw new ReactionError(
      "server-error",
      "Something went wrong in creating a stripe checkout session"
    );
  }
}
