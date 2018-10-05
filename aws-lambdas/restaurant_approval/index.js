const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo-aws.hasura.app/v1alpha1/graphql';
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

exports.handler = async (event, context, callback) => {
  const { id, event: {op, data}, table } = JSON.parse(event.body);
  console.log(`processing event ${id}`);

  if (data.new.is_paid) {
    // get the order id
    const order_id = data.new.id;

    // execute the restaurant approval logic
    const is_approved = await restaurant_approval(order_id);
    if (!is_approved) {
      return callback(null, {
        statusCode: 500,
        body: "approval failed"
      });
    }

    // once approved, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_RESTAURANT_APPROVAL,
        variables: { object: { order_id, is_approved }, id: order_id},
      });
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(mutationResponse)
      });
    } catch (err) {
      console.error('mutation failed', err);
      return callback(null, {
        statusCode: 500,
        body: "mutation failed"
      });
    }
  } else {
    return callback(null, {
      statusCode: 200,
      body: 'did not match conditions, ignoring event'
    });
  }
};

const restaurant_approval = (id) => {
  // do the restaurant approval logic here
  // typically, this would notify the restaurant and when they accept
  // returns immediately or executes another function which marks status
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};
