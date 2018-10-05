// Serverless function to handle payment request from the client.
// Mocks contacting payment gateway to process the request
// and triggers the payment_callback function to notify success or error
// payment_callback function updates the order with correct status

const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo-aws.hasura.app/v1alpha1/graphql';

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

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST',
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
};

exports.handler = async (event, context, callback) => {
  // handle CORS since this function is triggered from browser
  if (event.httpMethod == "OPTIONS") {
    return callback(null, {
      statusCode: 204,
      body: "",
      headers
    });
  }

  const { order_id, metadata: { type, amount }} = JSON.parse(event.body);

  // actual logic to process the payment
  const is_success = await process_payment(order_id);
  if (!is_success) {
    console.log('payment failed');
    return callback(null, {
      statusCode: 500,
      body: 'payment failed',
      headers
    });
  }

  // insert into database
  let data;
  try {
    const response = await query({
      endpoint: HGE_ENDPOINT,
      query: MUTATION_INSERT_PAYMENT,
      variables: { object: {order_id, type, amount, is_success} , id: order_id }
    });
    data = response.data;
  } catch (error) {
    return callback(null, {
      statusCode: 500,
      body: 'api failed',
      headers
    });
  }

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify(data),
    headers
  });
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
