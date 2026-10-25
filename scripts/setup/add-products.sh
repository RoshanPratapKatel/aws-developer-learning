# Three products for the catalog examples. The data modules store the display
# name in a title attribute, so the seed data uses title too.
aws dynamodb put-item --table-name Products --item '{
  "id": {"S": "prod_001"}, "title": {"S": "Wireless Headphones"},
  "price": {"N": "199.99"}, "category": {"S": "Electronics"},
  "description": {"S": "Over-ear headphones with active noise cancellation"}
}'

aws dynamodb put-item --table-name Products --item '{
  "id": {"S": "prod_002"}, "title": {"S": "USB-C Cable"},
  "price": {"N": "12.99"}, "category": {"S": "Electronics"},
  "description": {"S": "Two meter braided charging cable"}
}'

aws dynamodb put-item --table-name Products --item '{
  "id": {"S": "prod_003"}, "title": {"S": "Ceramic Mug"},
  "price": {"N": "8.49"}, "category": {"S": "Home Goods"},
  "description": {"S": "Twelve ounce stoneware mug"}
}'

# A customer record for the data masking examples
aws dynamodb put-item --table-name Customers --item '{
  "customer_id": {"S": "cust_001"}, "name": {"S": "Jordan Smith"},
  "email": {"S": "jordan.smith@example.com"}, "phone": {"S": "206-555-0142"},
  "address": {"S": "2021 7th Ave, Seattle, WA 98121"}
}'

# Two orders for that customer
aws dynamodb put-item --table-name Orders --item '{
  "customer_id": {"S": "cust_001"}, "order_id": {"S": "ord_1001"},
  "status": {"S": "shipped"}, "total_amount": {"N": "212.98"}
}'

aws dynamodb put-item --table-name Orders --item '{
  "customer_id": {"S": "cust_001"}, "order_id": {"S": "ord_1002"},
  "status": {"S": "processing"}, "total_amount": {"N": "8.49"}
}'

# An analytics summary for the role assumption examples
aws dynamodb put-item --table-name CustomerAnalytics --item '{
  "customer_id": {"S": "cust_001"}, "orders_placed": {"N": "2"},
  "lifetime_value": {"N": "221.47"}
}'