#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NestedStacksStack } from '../lib/nested-stacks-stack';

const app = new cdk.App();
new NestedStacksStack(app, 'NestedStacksStack');
