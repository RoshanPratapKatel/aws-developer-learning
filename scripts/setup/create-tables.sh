#!/usr/bin/env bash
set -euo pipefail

# Use the same region throughout the learning plan.
export AWS_REGION="us-east-1"
export AWS_DEFAULT_REGION="$AWS_REGION"
export AWS_PAGER=""

# Product catalog and category queries.
aws dynamodb create-table \
    --table-name Products \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=category,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes '[{
        "IndexName": "category-index",
        "KeySchema": [{"AttributeName": "category", "KeyType": "HASH"}],
        "Projection": {"ProjectionType": "ALL"}
    }]' \
    --billing-mode PAY_PER_REQUEST

# Customer records for data masking examples.
aws dynamodb create-table \
    --table-name Customers \
    --attribute-definitions AttributeName=customer_id,AttributeType=S \
    --key-schema AttributeName=customer_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

# Customer orders for authorization examples.
aws dynamodb create-table \
    --table-name Orders \
    --attribute-definitions AttributeName=customer_id,AttributeType=S AttributeName=order_id,AttributeType=S \
    --key-schema AttributeName=customer_id,KeyType=HASH AttributeName=order_id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

# Event log for event-driven workflow examples.
aws dynamodb create-table \
    --table-name AnalyticsEvents \
    --attribute-definitions AttributeName=event_id,AttributeType=S \
    --key-schema AttributeName=event_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

# Per-customer analytics for role assumption examples.
aws dynamodb create-table \
    --table-name CustomerAnalytics \
    --attribute-definitions AttributeName=customer_id,AttributeType=S \
    --key-schema AttributeName=customer_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

for table in Products Customers Orders AnalyticsEvents CustomerAnalytics; do
    aws dynamodb wait table-exists --table-name "$table"
done
