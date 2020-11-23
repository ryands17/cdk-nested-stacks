import * as cdk from '@aws-cdk/core'
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert'
import { MainApp } from '../lib/nested-stacks'

test('Should create the VPC and subnets in the main stack', () => {
  const stack = createStack()

  expectCDK(stack).to(
    haveResourceLike('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/20',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
      Tags: [
        {
          Key: 'Name',
          Value: 'NestedStacks/app-vpc',
        },
      ],
    })
  )

  for (let range of [0, 4, 8, 12]) {
    expectCDK(stack).to(
      haveResourceLike('AWS::EC2::Subnet', {
        CidrBlock: `10.0.${range}.0/22`,
        VpcId: {},
      })
    )
  }
})

test('Should create a Cloudformation Nested Stack', () => {
  const stack = createStack()
  expectCDK(stack).to(
    haveResourceLike('AWS::CloudFormation::Stack', {
      TemplateURL: {},
    })
  )
})

function createStack() {
  const stackName = 'NestedStacks'
  const app = new cdk.App()
  return new MainApp(app, stackName, {
    env: { region: process.env.CDK_REGION, account: process.env.CDK_ACCOUNT },
  })
}
