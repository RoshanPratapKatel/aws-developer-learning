import * as cdk from 'aws-cdk-lib/core';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ProductApiStack } from '../lib/product-api-stack';

let template: Template;

beforeAll(() => {
  const app = new cdk.App();
  template = Template.fromStack(new ProductApiStack(app, 'TestProductApiStack'));
});

test('packages five Node.js Lambda handlers', () => {
  template.resourceCountIs('AWS::Lambda::Function', 5);
  const functions = template.findResources('AWS::Lambda::Function');

  for (const resource of Object.values(functions)) {
    expect(resource.Properties).toMatchObject({
      Runtime: 'nodejs24.x',
      Handler: 'index.handler',
      Code: { S3Bucket: expect.anything(), S3Key: expect.anything() },
    });
  }
});

test.each([
  ['GET', 'products', 'QueryProducts'],
  ['POST', 'products', 'InsertProduct'],
  ['OPTIONS', 'products', 'Options'],
  ['GET', '{id}', 'GetProduct'],
  ['PUT', '{id}', 'UpdateProduct'],
  ['OPTIONS', '{id}', 'Options'],
])('%s on %s uses the %s Lambda proxy integration', (method, pathPart, functionId) => {
  const resources = template.findResources('AWS::ApiGateway::Resource', {
    Properties: { PathPart: pathPart },
  });
  const [resourceId] = Object.keys(resources);
  const lambdaId = Object.keys(
    template.findResources('AWS::Lambda::Function'),
  ).find((id) => id.startsWith(functionId));

  expect(resourceId).toBeDefined();
  expect(lambdaId).toBeDefined();

  template.hasResourceProperties('AWS::ApiGateway::Method', {
    HttpMethod: method,
    ResourceId: { Ref: resourceId },
    Integration: {
      Type: 'AWS_PROXY',
      IntegrationHttpMethod: 'POST',
      Uri: {
        'Fn::Join': [
          '',
          Match.arrayWith([{ 'Fn::GetAtt': [lambdaId, 'Arn'] }]),
        ],
      },
    },
  });
});

test('nests the product ID route and exposes the dev endpoint', () => {
  const [productsId] = Object.keys(
    template.findResources('AWS::ApiGateway::Resource', {
      Properties: { PathPart: 'products' },
    }),
  );

  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: '{id}',
    ParentId: { Ref: productsId },
  });
  template.hasResourceProperties('AWS::ApiGateway::Stage', {
    StageName: 'dev',
    DeploymentId: Match.anyValue(),
  });
  const [stageId] = Object.keys(
    template.findResources('AWS::ApiGateway::Stage', {
      Properties: { StageName: 'dev' },
    }),
  );
  template.hasOutput('ProductsApiUrl', {
    Value: {
      'Fn::Join': ['', Match.arrayWith([{ Ref: stageId }])],
    },
  });
  template.hasResourceProperties('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    Principal: 'apigateway.amazonaws.com',
    SourceArn: Match.anyValue(),
  });
});
