#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkTsLambdaCanaryDeployStack } from '../lib/cdk-ts-lambda-canary-deploy-stack';

const app = new cdk.App();

const environmentType = app.node.tryGetContext('environmentType');
const environmentContext = app.node.tryGetContext(environmentType);
const region = environmentContext['region'];
const account = app.node.tryGetContext('account');
const stackName = `${app.node.tryGetContext("prefix")}-${environmentType}`

new CdkTsLambdaCanaryDeployStack(app, stackName, {
  env: {
    account,
    region,
  }
});
