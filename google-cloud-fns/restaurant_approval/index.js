const { query } = require('graphqurl');

const MUTATION_RESTAURANT_APPROVAL = `
mutation restaurantApproval(
  $object: restaurant_approval_insert_input!,
  $id: uuid!
) {
  insert_restaurant_approval(
    objects: [$object],
    on_conflict: {
      action: ignore,
      constraint: restaurant_approval_pkey
    }
) {
    returning {
      created_at
    }
    affected_rows
  }
  update_order(
    _set:{is_approved: true},
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

  const { id, event: {op, data}, table } = req.body;
  console.log(`processing event ${id}`);

  if (data.new.is_paid) {
    // get the order id
    const order_id = data.new.id;

    // execute the restaurant approval logic
    const is_approved = await restaurant_approval(order_id);
    if (!is_approved) {
      res.status(500);
      res.json({error: true, data: 'approval failed'});
      return;
    }

    // once approved, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_RESTAURANT_APPROVAL,
        variables: { object: { order_id, is_approved }, id: order_id },
      });
      res.json({error: false, data: mutationResponse});
    } catch (err) {
      console.error('mutation failed', err);
      res.status(500);
      res.json({error: true, data: err});
    }
  } else {
    res.json({error:false, data: 'did not match conditions, ignoring event'});
  }
};

const restaurant_approval = (id) => {
  // do the restaurant approval logic here
  // typically, this would notify the restaurant and when they accept
  // returns immediately or executes another function which marks status
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 10);
  });
};
