export default async function stripeOneTimePayment(_, { input }, context) {
  const { price, quoteId } = input;

  console.log("In stripe one time payment main function ", price, quoteId);
  const response = await context.mutations.stripeOneTimePayment(context, {
    price,
    quoteId,
  });

  return response;
}
