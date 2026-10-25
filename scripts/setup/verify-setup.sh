# All five tables should report ACTIVE
for table in Products Customers Orders AnalyticsEvents CustomerAnalytics; do
    echo "$table: $(aws dynamodb describe-table --table-name $table \
        --query 'Table.TableStatus' --output text)"
done

# The product catalog should contain three items
aws dynamodb scan --table-name Products --select COUNT --query Count

# Your bucket should appear in the list
aws s3 ls | grep online-store-assets