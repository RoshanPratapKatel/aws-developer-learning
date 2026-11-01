## Bootstrapping

Bootstrap prepares your AWS account for AWS CDK deployments, and it is safe to run multiple times. 
From the directory of your CDK project, run the following commands: 

Step 1: Bootstrap AWS CDK

```bash
# Navigate to project directory
cd product-api

# Bootstrap AWS CDK, naming the account and Region explicitly
cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# For example:
#   cdk bootstrap aws://123456789012/us-east-1

# Expected output:
#   Bootstrapping environment aws://123456789012/us-east-1...
#   Environment aws://123456789012/us-east-1 bootstrapped.
```

Step 2: Synthesize the template (optional but recommended)

Synthesis converts your AWS CDK code to CloudFormation without deploying. This lets you review what will be created:

```bash
# Generate CloudFormation template
cdk synth ProductApiStack

# This creates a template in cdk.out/ directory
# Review the template to understand what resources will be created
```

Step 3: Deploy your API Stack

Deployment creates actual AWS resources. AWS CDK shows you exactly what it will create before proceeding:

```bash
# Deploy the stack
cdk deploy ProductApiStack

# CDK will display:
# - Resources to be created/updated/deleted
# - IAM policy changes (if any)
# - Estimated costs (if significant)

# Type 'y' to confirm deployment
```

Step 4: Save your API endpoint

The deployment output includes your API Gateway URL. 

```bash
# Copy the ProductsApiUrl from the output above
API_URL="https://abc123def4.execute-api.us-east-1.amazonaws.com/dev"
```

# Understanding what gets deployed

`cdk deploy ProductApiStack` creates the application resources below.
These are separate from the shared `CDKToolkit` resources created by bootstrap.
No database is deployed: products still come from the in-memory catalog.

## AWS Lambda functions

CDK bundles our TypeScript handlers into JavaScript for the Node.js runtime.
The handler file names below are not necessarily the deployed Lambda names.

| Handler | Request | Behavior |
|---|---|---|
| `get_product` | `GET /products/{id}` | Returns one product, or a missing-ID/not-found error |
| `query_products` | `GET /products` | Returns all products or filters by the optional `category` parameter |
| `insert_product` | `POST /products` | Placeholder: returns `501` with `NotImplementedError` |
| `update_product` | `PUT /products/{id}` | Placeholder: returns `501` with `NotImplementedError` |
| `options` | `OPTIONS` on either path | Returns CORS preflight headers and an empty body |

## Amazon API Gateway REST API

API Gateway routes each HTTP method and path to its designated Lambda using
proxy integration. It packages request details into an event, then uses the
Lambda's status code, headers, and body to produce the HTTP response.

CORS headers come from our handlers, including the `OPTIONS` preflight handler.
There are no custom request/response mapping templates or API Gateway request
validators configured. Application validation and error responses are handled
in our Lambda code; API Gateway can also return its own service errors.
The `dev` stage is unauthenticated for this tutorial: CORS is not access control.

## IAM roles and permissions

Each Lambda gets an execution role with permissions to write CloudWatch logs.
CDK also adds Lambda resource-based permissions allowing API Gateway to invoke
the functions, scoped to the API's routes and stages.
These integrations do not require an API Gateway service role to invoke Lambda.
No database access permissions are needed yet.

## Amazon CloudWatch resources

Each Lambda has a log group for execution logs and our `console.error` messages.
Lambda and API Gateway also publish standard service metrics for monitoring.
Our stack does not configure finite log retention, custom alarms, dashboards,
or API Gateway access/execution logging. Logs do not automatically expire under
the current configuration.

## Deployment timeline

The course estimates **2-5 minutes** for a small deployment. Its illustrative
breakdown is:

| Work | Approximate time |
|---|---|
| CloudFormation change set creation | 30 seconds |
| Lambda deployment | 1-2 minutes |
| API Gateway configuration | 1-2 minutes |
| IAM role and policy creation | 30 seconds |

These are not guarantees or sequential steps: CloudFormation creates independent
resources in parallel and waits for dependencies. Local bundling, asset uploads,
and AWS service conditions also affect the total time.

## Cost considerations

Free Tier eligibility depends on the account's plan, age, and existing usage.
Allowances are shared with other usage in the account, not allocated per project.

| Service | Published allowance or qualification |
|---|---|
| Lambda Event Functions | 1 million requests and 400,000 GB-seconds of compute per month |
| API Gateway | The legacy offer includes 1 million REST API calls per month for up to 12 months; new customers from July 15, 2025 use the revised credit-based Free Tier |
| CloudWatch Logs | Published pricing examples include 5 GB of log ingestion and 5 GB of archived storage allowances; check applicability to your account |

Do not assume the deployment is free. Usage beyond applicable allowances,
data transfer, and bootstrap S3 artifact storage can incur charges.
Check your Billing console and the current
[Lambda](https://aws.amazon.com/lambda/pricing/),
[API Gateway](https://aws.amazon.com/api-gateway/pricing/), and
[CloudWatch](https://aws.amazon.com/cloudwatch/pricing/) pricing pages.


## Testing your deployed API

Verify your API works by testing the endpoints: 

```bash
# Replace with your actual API URL from deployment output
API_URL="https://<api-id>.execute-api.<region>.amazonaws.com/dev"

# Test 1: List all products (should work)
curl "$API_URL/products"

# Test 2: Get specific product (should work)
curl "$API_URL/products/prod_001"

# Test 3: Filter by category (should work)
curl "$API_URL/products?category=Electronics"

# Test 4: CORS preflight (should work)
curl -X OPTIONS "$API_URL/products" -v

# Test 5: Create product (returns NotImplementedError)
curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Product", "price": 99.99}'

# Test 6: Update product (returns NotImplementedError)
curl -X PUT "$API_URL/products/prod_001" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Product", "price": 149.99}'
```

## Common AWS CDK commands: 

```bash
# View deployed stacks
cdk list

# Update your deployment
cdk deploy ProductApiStack

# Quick update for code changes
cdk deploy ProductApiStack --hotswap

# Get API URL
aws cloudformation describe-stacks --stack-name ProductApiStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ProductsApiUrl`].OutputValue' \
  --output text
```

## Troubleshooting

Run commands from `product-api/`. Our project uses TypeScript, so the course's
Python-specific fixes need the equivalents below.

| Problem | What to check |
|---|---|
| Missing or outdated bootstrap resources | Run `cdk bootstrap aws://ACCOUNT-NUMBER/REGION` with your intended account and Region. If bootstrap itself fails, inspect the error for credentials or permission problems. |
| "Another CLI is currently synthing" or an output lock error | Check whether another CDK command is still running; let it finish first. An interrupted command may leave a stale lock. Only when no CDK process is running, remove the stale lock file identified by the error (for example, `cdk.out/synth.lock`) and retry. Never delete an active command's lock. |
| Missing asset or bundling error | Check that each `NodejsFunction` entry file exists in `lambda_code/` and exports `handler`. Our entry paths use `path.join(__dirname, ...)`, relative to the stack file, not the shell's working directory. For upload failures, check bootstrap resources and publishing permissions. |
| Import or TypeScript error | Run `npm run build`. Check that `bin/product-api.ts` imports and instantiates the exported `ProductApiStack` class from `lib/product-api-stack.ts`. If dependencies are missing, restore them with `npm ci`. |
| Course suggests changing `cdk.json` to `"python3 app.py"` on macOS | This does not apply to our TypeScript project. Keep `"app": "npx tsc && npx tsx bin/product-api.ts"`; check that Node.js and npm are available. |
| Credentials or permission error | Run `aws sts get-caller-identity` and confirm the intended identity/account. Valid credentials do not guarantee deployment permissions: inspect the denied action and use an appropriately authorized identity. Use the same named profile for AWS CLI and CDK commands if applicable. |

The project includes a local CDK CLI. If `cdk` is not available globally, use
`npm run cdk -- <command>`, for example:

```bash
npm run cdk -- synth ProductApiStack
```


## Clean up when finished

```bash
# Remove all deployed resources
cdk destroy ProductApiStack

# Confirm deletion when prompted
```