#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { MainApp } from '../lib/nested-stacks-stack'

const app = new cdk.App()
new MainApp(app, 'NestedStacks', {
  env: {
    region: app.node.tryGetContext('region'),
    account: app.node.tryGetContext('accountID'),
  },
})
