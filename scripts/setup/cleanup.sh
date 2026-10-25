# Delete the five tables
for table in Products Customers Orders AnalyticsEvents CustomerAnalytics; do
    aws dynamodb delete-table --table-name $table
done

# Empty the bucket, then delete it
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="${COURSE_BUCKET:-online-store-assets-${ACCOUNT_ID}}"
aws s3 rm "s3://$BUCKET" --recursive
aws s3api delete-bucket --bucket "$BUCKET"