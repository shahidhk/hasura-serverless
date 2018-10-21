// Serverless function to handle payment request from the client.
// Mocks contacting payment gateway to process the request
// and triggers the payment_callback function to notify success or error
// payment_callback function updates the order with correct status

const { query } = require('graphqurl');

const MUTATION_INSERT_PAYMENT = `
mutation processPayment($object: payment_insert_input!, $id: uuid!) {
  insert_payment(objects:[$object], on_conflict: {
    action: ignore,
    constraint: payment_pkey
  }) {
    affected_rows
    returning {
      created_at
    }
  }
  update_order(
    _set:{is_paid: true},
    where: {id: {_eq: $id}}
  ) {
    affected_rows
  }
}`;

/**
 * HTTP Cloud Function.
 * This function is exported by index.js, and is executed when
 * you make an HTTP request to the deployed function's endpoint.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.function = async (req, res) => {
  const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo.hasura.app/hge/v1alpha1/graphql';

  // handle CORS since this function is triggered from browser
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method == "OPTIONS") {
    res.status(204).send('');
    return;
  }

  const { order_id, metadata: { type, amount }} = req.body;

  // actual logic to process the payment
  const is_success = await process_payment(order_id);
  if (!is_success) {
    res.status(500);
    res.json({error: true, data: 'payment failed'});
    return;
  }

  // insert into database
  let data;
  try {
    const response = await query({
      endpoint: HGE_ENDPOINT,
      query: MUTATION_INSERT_PAYMENT,
      variables: { object: {order_id, type, amount, is_success}, id: order_id}
    });
    data = response.data;
  } catch (error) {
    res.status(500);
    res.json({error: true, error});
  }

  res.json({error: false, data});
};

const process_payment = (order_id) => {
  // do the agent assignment logic here
  // typically, this would include picking up a free agent and
  // assigning them
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};
