const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo-aws.hasura.app/v1alpha1/graphql';
const MUTATION_PAY_ALL = `
mutation payAll($user_name: String!) {
  update_order(
    where: {
      user_name: {_eq: $user_name},
      is_validated: {_eq: true},
      is_paid: {_eq: false},
    },
    _set: {
      is_paid: true
    }
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

  const { user_name } = JSON.parse(event.body);

  // pay all orders
  let data;
  try {
    const response = await query({
      endpoint: HGE_ENDPOINT,
      query: MUTATION_PAY_ALL,
      variables: { user_name }
    });
    data = response.data;
  } catch (error) {
    console.error(error);
    return callback(null, {
      statusCode: 500,
      body: 'mutation failed',
      headers
    });
  }

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify(data),
    headers
  });
};
