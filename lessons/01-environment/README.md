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