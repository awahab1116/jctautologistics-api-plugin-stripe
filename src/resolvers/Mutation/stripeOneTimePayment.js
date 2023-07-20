export default async function stripeOneTimePayment(_, { input }, context) {
  const { price } = input;

  console.log("In stripe one time payment main function ", price);
  const response = await context.mutations.stripeOneTimePayment(context, {
    price,
  });

  return response;
}
