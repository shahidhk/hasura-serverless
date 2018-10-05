const { query } = require('graphqurl');

const MUTATION_MARK_ORDER_VALIDATED = `
mutation orderValidated($id: uuid!) {
  insert_order_validation(objects:[{
    is_validated: true,
    order_id: $id
  }], on_conflict: {
    action: ignore,
    constraint: order_validation_pkey
  }) {
    affected_rows
    returning {
      validated_at
    }
  }

  update_order(
    _set:{is_validated: true},
    where: {id: {_eq: $id}}
  ) {
    affected_rows
  }
}`;

exports.handler = async (event, context, callback) => {
  const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo-aws.hasura.app/v1alpha1/graphql';
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return callback(null, {statusCode: 400, body: "cannot parse hasura event"});
  }

  const { id, event: {op, data}, table } = payload;
  console.log(`processing event ${id}`);

  if (op === 'INSERT' && table.name === 'order') {
    // get the order id
    const order_id = data.new.id;

    // execute the validation logic
    const status = await validate_order(order_id);
    if (status !== true) {
      return callback(null, {statusCode: 500, body: "validation failed"});
    }

    // once the validation is complete, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_MARK_ORDER_VALIDATED,
        variables: { id: order_id },
      });
      return callback(null, {statusCode: 200, body: JSON.stringify(mutationResponse)});
    } catch (err) {
      console.error('mutation failed', err);
      return callback(null, {statusCode: 500, body: JSON.stringify(err)});
    }
  } else {
    return callback(null, {statusCode: 200, body: 'did not match conditions, ignoring event'});
  }
};

const validate_order = (id) => {
  // do the order validation logic here
  // e.g. contact 3rd party APIs etc.
  // should check if the order is already validated
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};
