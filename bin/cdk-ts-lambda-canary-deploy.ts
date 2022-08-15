#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkTsLambdaCanaryDeployStack } from '../lib/cdk-ts-lambda-canary-deploy-stack';

const app = new cdk.App();
new CdkTsLambdaCanaryDeployStack(app, 'CdkTsLambdaCanaryDeployStack');
