const { query } = require('graphqurl');

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
  const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo.hasura.app/v1alpha1/graphql';

  // handle CORS since this function is triggered from browser
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method == "OPTIONS") {
    res.status(204).send('');
    return;
  }

  const { user_name } = req.body;

  // mark all validated orders as paid
  try {
    const response = await query({
      endpoint: HGE_ENDPOINT,
      query: MUTATION_PAY_ALL,
      variables: { user_name }
    });
    data = response.data;
  } catch (error) {
    res.status(500);
    res.json({error: true, error});
    return;
  }

  res.json({error: false, data});
};
