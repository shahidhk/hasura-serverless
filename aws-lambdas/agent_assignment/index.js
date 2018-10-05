const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://serverless-demo-aws.hasura.app/v1alpha1/graphql';
const MUTATION_ASSIGN_AGENT = `
mutation assignAgent(
  $object: agent_assignment_insert_input!,
  $id: uuid!
) {
  insert_agent_assignment(
    objects: [$object],
    on_conflict: {
      action: ignore,
      constraint: agent_assignment_pkey
    }
) {
    returning {
      created_at
    }
    affected_rows
  }
  update_order(
    _set:{is_agent_assigned: true},
    where: {id: {_eq: $id}}
  ) {
    affected_rows
  }
}`;

exports.handler = async (event, context, callback) => {
  const { id, event: {op, data}, table } = JSON.parse(event.body);
  console.log(`processing event ${id}`);

  if (data.new.is_approved) {
    // get the order id
    const order_id = data.new.id;

    // execute the agent assignment logic
    const { is_assigned, agent_id } = await assign_agent(order_id);
    if (!is_assigned) {
      return callback(null, {
        statusCode: 500,
        body: "assignment failed"
      });
    }

    // once assigned, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_ASSIGN_AGENT,
        variables: { object: { is_assigned, agent_id, order_id }, id: order_id},
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

const assign_agent = (order_id) => {
  // do the agent assignment logic here
  // typically, this would include picking up a free agent and
  // assigning them
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ is_assigned: true, agent_id: newUUID()});
    }, 1000);
  });
};

const newUUID = () => {
  const p8 = (s) => {
    let p = (Math.random().toString(16) + "000000000").substr(2 ,8);
    return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
  };
  return p8() + p8(true) + p8(true) + p8();
};
