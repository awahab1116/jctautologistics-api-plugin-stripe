export default async function stripeOneTimePayment(_, { input }, context) {
  const { quoteId } = input;
  console.log("hello");
  console.log("In stripe one time payment main function ", quoteId);
  const response = await context.mutations.stripeOneTimePayment(context, {
    quoteId,
  });

  return response;
}
