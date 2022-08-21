import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Runtime, Alias } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Alarm, ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';
import { LambdaDeploymentConfig, LambdaDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy';
import path = require('path');

export class CdkTsLambdaCanaryDeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environmentType = this.node.tryGetContext('environmentType') // cdk.jsonで定義されたcontextを取り出す
    const context = this.node.tryGetContext(environmentType)
    const aliasName = context['lambda']['alias']
    const stageName = context['lambda']['stage']
    const today = new Date();
    const currentDate = `${today.getDate()}-${(today.getMonth() + 1)}-${today.getFullYear()}`

    const myLambda = new NodejsFunction(this, 'MyFunction', {
      functionName: context['lambda']['name'],
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '../lambda/handler.ts'),
      currentVersionOptions: {
        description: `Version deployed on ${currentDate}`,
        removalPolicy: RemovalPolicy.RETAIN
      }
    });

    const newVersion = myLambda.currentVersion;
    newVersion.applyRemovalPolicy(RemovalPolicy.RETAIN)

    const alias = new Alias(this, 'FunctionAlias', {
      aliasName: aliasName,
      version: newVersion
    });

    new LambdaRestApi(this, 'RestApi', {
      handler: alias,
      deployOptions: {
        stageName,
      }
    });

    const failureAlarm = new Alarm(this, 'FunctionFailure', {
      metric: alias.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'The latest deployment errors > 0',
      alarmName: `${stageName}-canary-alarm`,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD
    });

    new LambdaDeploymentGroup(this, 'CanaryDeployment', {
      alias: alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [ failureAlarm ]
    });
  }
}
