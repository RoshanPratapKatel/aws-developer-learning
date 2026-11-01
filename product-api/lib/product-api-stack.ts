import * as cdk from 'aws-cdk-lib/core';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import * as path from 'node:path';

export class ProductApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProduct = new NodejsFunction(this, 'GetProduct', {
      runtime: Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '../lambda_code/get_product.ts'),
      handler: 'handler',
    });

    const queryProducts = new NodejsFunction(this, 'QueryProducts', {
      runtime: Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '../lambda_code/query_products.ts'),
      handler: 'handler',
    });

    const insertProduct = new NodejsFunction(this, 'InsertProduct', {
      runtime: Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '../lambda_code/insert_product.ts'),
      handler: 'handler',
    });

    const updateProduct = new NodejsFunction(this, 'UpdateProduct', {
      runtime: Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '../lambda_code/update_product.ts'),
      handler: 'handler',
    });

    const options = new NodejsFunction(this, 'Options', {
      runtime: Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '../lambda_code/options.ts'),
      handler: 'handler',
    });

    // These tutorial endpoints are unauthenticated; CORS is not access control.
    const api = new apigw.RestApi(this, 'ProductsAPI', {
      deployOptions: { stageName: 'dev' },
      defaultMethodOptions: { authorizationType: apigw.AuthorizationType.NONE },
    });

    const products = api.root.addResource('products');
    products.addMethod('GET', new apigw.LambdaIntegration(queryProducts));
    products.addMethod('POST', new apigw.LambdaIntegration(insertProduct));
    products.addMethod('OPTIONS', new apigw.LambdaIntegration(options));

    const productById = products.addResource('{id}');
    productById.addMethod('GET', new apigw.LambdaIntegration(getProduct));
    productById.addMethod('PUT', new apigw.LambdaIntegration(updateProduct));
    productById.addMethod('OPTIONS', new apigw.LambdaIntegration(options));

    new cdk.CfnOutput(this, 'ProductsApiUrl', { value: api.url });
  }
}
