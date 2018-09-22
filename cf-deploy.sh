#! /usr/bin/env bash

HGE_ENDPOINT="https://serverless-demo.hasura.app/hge/v1alpha1/graphql"

cfs=$(ls lambdas)

for cf in $cfs; do
    echo "deploying ${cf}..."
    cd lambdas/${cf}
    gcloud beta functions deploy ${cf} --runtime nodejs8 --trigger-http --project hasura-serverless --set-env-vars HGE_ENDPOINT=${HGE_ENDPOINT}
    cd ../..
done

