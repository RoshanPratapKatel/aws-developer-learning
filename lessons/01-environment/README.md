# 01 - Environment setup

## Install AWS CLI (macOS)

```bash
curl -fsSL "https://awscli.amazonaws.com/v2/install.sh" | bash
aws --version
```

## Configure AWS credentials (IAM access keys, no SSO)

```bash
aws configure
```

Enter your IAM user's access key ID, secret access key, default region
(`us-east-1`), and output format (`json`). Never commit access keys.

No separate login command is needed with access keys. Verify the active identity:

```bash
aws sts get-caller-identity
aws configure get region
```

The `Account` field is your 12-digit AWS account ID, not your IAM user ID.
Use the same region throughout the learning plan.

## Install AWS CDK

Requires a supported Node.js LTS version and npm.

```bash
node --version
npm --version
npm install -g aws-cdk
cdk --version
```

CDK uses the same AWS credentials; it does not need a separate login.

## Bootstrap the account and region

Replace `ACCOUNT_ID` with the `Account` value returned above:

```bash
cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

Creates the shared `CDKToolkit` deployment resources, not the course's tables
or application. Usually needed once per account and region. The default
CloudFormation execution role has administrator permissions.

If access is denied, check both the user's policies and permissions boundary.

## Create the practice tables

From the repository root, run:

```bash
bash scripts/setup/create-tables.sh
```

Creates the five shared DynamoDB tables in `us-east-1` and waits until they are
ready. Run once: existing tables cause the script to fail. The script stops on
errors but does not roll back tables already created.

List the tables to confirm they were created:

```bash
aws dynamodb list-tables --region us-east-1
```

## Create the practice S3 bucket

From the repository root, run once:

```bash
bash scripts/setup/create-s3-bucket.sh
```

Creates `online-store-assets-<account-id>` for file storage and presigned URL
examples. Use `us-east-1`, matching the tables.

The bucket name, ARN, and region are saved locally in `.env.local` (ignored by
Git). Load them in each new terminal session from the repository root:

```bash
source .env.local
echo "$COURSE_BUCKET"
```

This file is not loaded automatically. Use `$COURSE_BUCKET` wherever later
commands need your bucket name; the full creation response does not need saving.

## Add products to the database table

From the repository root, run once:
```bash
bash scripts/setup/add-products.sh
```

## Verify setup 

From the repository root, run once: 
```bash
bash scripts/setup/verify-setup.sh
```

## Cleanup after the plan: 

After the learning plan is complete, or any time you want to stop for a while, deleting these resources stops all 
charges related to them.

From the repository roo, run once:
```bash
bash scripts/setup/cleanup-sh
```