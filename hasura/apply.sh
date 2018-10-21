#! /bin/bash

HGE_ENDPOINT=https://serverless-demo.hasura.app
VALIDATE_ORDER=https://us-central1-hasura-serverless.cloudfunctions.net/validate_order
RESTAURANT_APPROVAL=https://us-central1-hasura-serverless.cloudfunctions.net/restaurant_approval
AGENT_ASSIGNMENT=https://us-central1-hasura-serverless.cloudfunctions.net/agent_assignment

METADATA=$(eval "cat <<EOF
$(<migrations/metadata.yaml.tmpl)
EOF
")

echo "$METADATA" > migrations/metadata.yaml

hasura --endpoint "$HGE_ENDPOINT" migrate apply
hasura --endpoint "$HGE_ENDPOINT" metadata apply
