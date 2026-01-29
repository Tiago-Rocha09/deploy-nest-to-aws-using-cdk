#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { EcrStack } from "../lib/ecr-stack";
import { VpcStack } from "../lib/vpc-stack";

const app = new cdk.App();

const tagsInfra = {
  owner: "Tiago",
  project: "ecommerce",
  environment: "dev",
};

const env: cdk.Environment = {
  account: "826997462744",
  region: "us-east-1",
};

const ecrStack = new EcrStack(app, "Ecr", { tags: tagsInfra, env });

const vpcStack = new VpcStack(app, "Vpc", { tags: tagsInfra, env });
