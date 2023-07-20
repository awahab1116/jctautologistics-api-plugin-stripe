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
  const { price } = input;

  try {
    console.log("in inner function stripe ", price);
    console.log("process env is ", process.env.STRIPE_API_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
      mode: "payment",
      success_url: "https://www.google.com",
      cancel_url: "https://www.npmjs.com/package/stripe",
    });

    console.log("Session is ", session);
    let stripeCheckoutUrl = session.url;

    return {
      start: "in stripe",
      url: stripeCheckoutUrl,
      stripeJson: JSON.stringify(session),
      // stripeJson: session,
    };
  } catch (err) {
    throw new ReactionError(
      "server-error",
      "Something went wrong in creating a stripe checkout session"
    );
  }
}
