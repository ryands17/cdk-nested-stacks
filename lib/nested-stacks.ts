import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'

export class MainApp extends cdk.Stack {
  baseResources: BaseResources
  appResources: AppResources

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.baseResources = new BaseResources(this, 'base-resources')
    const { vpc, applicationSg } = this.baseResources

    this.appResources = new AppResources(this, 'app-resources', {
      vpc,
      applicationSg,
    })

    this.appResources.addDependency(this.baseResources)
  }
}

class BaseResources extends cdk.NestedStack {
  vpc: ec2.Vpc
  applicationSg: ec2.SecurityGroup

  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props)

    this.vpc = new ec2.Vpc(this, 'app-vpc', {
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

    this.applicationSg = new ec2.SecurityGroup(this, 'application-sg', {
      vpc: this.vpc,
      securityGroupName: 'application-sg',
    })

    this.applicationSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80))
  }
}

interface AppResourcesProps extends cdk.NestedStackProps {
  vpc: ec2.Vpc
  applicationSg: ec2.SecurityGroup
}

class AppResources extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props: AppResourcesProps) {
    super(scope, id, props)

    // The EC2 instance using Amazon Linux 2
    const instance = new ec2.Instance(this, 'simple-server', {
      vpc: props.vpc,
      instanceName: 'simple-server',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: props.applicationSg,
    })

    // Display a simple webpage
    instance.addUserData(
      'yum install -y httpd',
      'systemctl start httpd',
      'systemctl enable httpd',
      'echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html'
    )

    // Add the policy to access EC2 without SSH
    instance.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    )
  }
}
