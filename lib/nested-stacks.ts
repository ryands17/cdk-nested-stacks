import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'

export class MainApp extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'app-vpc', {
      cidr: '10.0.0.0/20',
      natGateways: 0,
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 22,
          name: 'private',
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    })

    const publicSg = new ec2.SecurityGroup(this, 'public-sg', {
      vpc,
      securityGroupName: 'public-sg',
    })

    new ServerInstance(this, 'ec2Instance', { vpc, publicSg })
  }
}

interface ServerInstanceProps extends cdk.NestedStackProps {
  vpc: ec2.Vpc
  publicSg: ec2.SecurityGroup
}

class ServerInstance extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props: ServerInstanceProps) {
    super(scope, id, props)

    // The Ubuntu EC2 instance
    const instance = new ec2.Instance(this, 'simple-server', {
      vpc: props.vpc,
      instanceName: 'simple-server',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: props.publicSg,
    })

    // Add the policy to access EC2 without SSH
    instance.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    )
  }
}
