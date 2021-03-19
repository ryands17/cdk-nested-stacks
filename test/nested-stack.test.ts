import * as cdk from '@aws-cdk/core'
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert'
import { MainApp } from '../lib/nested-stacks'

test('Should create the VPC and subnets as the base resources', () => {
  const { baseResources } = createStack()

  expectCDK(baseResources).to(
    haveResourceLike('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/20',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
      Tags: [
        {
          Key: 'Name',
          Value: 'NestedStacks/base-resources/app-vpc',
        },
      ],
    })
  )

  for (let range of [0, 4, 8, 12]) {
    expectCDK(baseResources).to(
      haveResourceLike('AWS::EC2::Subnet', {
        CidrBlock: `10.0.${range}.0/22`,
        VpcId: {},
      })
    )
  }
})

test('Should create an EC2 instance and IAM Instance Profile as the application resource', () => {
  const { appResources } = createStack()

  expectCDK(appResources).to(haveResourceLike('AWS::IAM::InstanceProfile'))
  expectCDK(appResources).to(
    haveResourceLike('AWS::EC2::Instance', {
      AvailabilityZone: {},
      IamInstanceProfile: {},
      InstanceType: 't2.micro',
      SecurityGroupIds: [],
      Tags: [
        {
          Key: 'Name',
          Value: 'simple-server',
        },
      ],
      UserData: {
        'Fn::Base64':
          '#!/bin/bash\nyum install -y httpd\nsystemctl start httpd\nsystemctl enable httpd\necho "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html',
      },
    })
  )
})

function createStack() {
  const app = new cdk.App()
  return new MainApp(app, 'NestedStacks', {
    env: { region: process.env.CDK_REGION || 'us-east-2' },
  })
}
