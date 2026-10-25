# Use the Region from this session, or fall back to your configured Region
REGION="${AWS_REGION:-$(aws configure get region)}"

# Amazon S3 bucket names are globally unique, so include your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export COURSE_BUCKET="online-store-assets-${ACCOUNT_ID}"

# The us-east-1 Region must omit the location constraint
if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$COURSE_BUCKET"
else
    aws s3api create-bucket --bucket "$COURSE_BUCKET" \
        --create-bucket-configuration LocationConstraint="$REGION"
fi

echo "Your course bucket: $COURSE_BUCKET (Region: $REGION)"