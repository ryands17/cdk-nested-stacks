import * as cdk from '@aws-cdk/core'
import * as cfn from '@aws-cdk/aws-cloudformation'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'

interface ServerInstanceProps extends cfn.NestedStackProps {
  vpc: ec2.Vpc
  publicSg: ec2.SecurityGroup
}

class ServerInstance extends cfn.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: ServerInstanceProps) {
    super(scope, id, props)

    // Fetch the latest Ubuntu AMI (20.04 as of now)
    const ami = new ec2.LookupMachineImage({
      name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*',
      filters: { 'virtualization-type': ['hvm'] },
      owners: ['099720109477'],
    })

    if (props) {
      // The Ubuntu EC2 instance
      const instance = new ec2.Instance(this, 'simple-server', {
        vpc: props.vpc,
        instanceName: 'simple-server',
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.genericLinux({
          [this.region]: ami.getImage(this).imageId,
        }),
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        securityGroup: props.publicSg,
      })

      // Add the policy to access EC2 without SSH
      instance.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore'
        )
      )
    }
  }
}

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
      vpc: vpc,
      securityGroupName: 'public-sg',
    })

    new ServerInstance(this, 'ec2Instance', { vpc, publicSg })
  }
}
