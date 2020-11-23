# Basic example of Nested Stacks

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Steps

1. Rename the `cdk.context.example.json` file to `cdk.context.json` and replace all the values with predefined values for your stack (required).

2. Run `yarn` (recommended) or `npm install`

3. Run `yarn cdk deploy --profile profileName` to deploy the stack to your specified region. You can skip providing the profile name if it is `default`. You can learn about creating profiles using the aws-cli [here](https://docs.aws.amazon.com/cli/latest/reference/configure/#configure).

4. You will notice two stacks created, and one will be a nested stack that holds the EC2 instance and the parent stack the entire VPC setup.

## Useful commands

- `yarn build` compile typescript to js
- `yarn watch` watch for changes and compile
- `yarn test` perform the jest unit tests
- `yarn cdk deploy` deploy this stack to your default AWS account/region
- `yarn cdk diff` compare deployed stack with current state
- `yarn cdk synth` emits the synthesized CloudFormation template
