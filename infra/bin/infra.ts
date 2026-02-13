#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { EcrStack } from "../lib/ecr-stack";
import { VpcStack } from "../lib/vpc-stack";
import { ClusterStack } from "../lib/cluster-stack";
import { LoadBalancerStack } from "../lib/lb-stack";
import { ProductsServiceStack } from "../lib/productsService-stack";
import { ApiStack } from "../lib/api-stack";

const app = new cdk.App();

const tagsInfra = {
  owner: "Tiago",
  project: "ecommerce",
  environment: "dev",
};

const env: cdk.Environment = {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
};

const ecrStack = new EcrStack(app, "Ecr", { tags: tagsInfra, env });

const vpcStack = new VpcStack(app, "Vpc", { tags: tagsInfra, env });

const lbStack = new LoadBalancerStack(app, "LoadBalancer", {
  tags: tagsInfra,
  env,
  vpc: vpcStack.vpc,
});
lbStack.addDependency(vpcStack);

const clusterStack = new ClusterStack(app, "Cluster", {
  tags: tagsInfra,
  env,
  vpc: vpcStack.vpc,
});

clusterStack.addDependency(vpcStack);

const tagsProductsService = {
  cost: "ProductsService",
  team: "Tiago",
};

const productsServiceStack = new ProductsServiceStack(app, "ProductsService", {
  tags: tagsProductsService,
  env,
  alb: lbStack.alb,
  cluster: clusterStack.cluster,
  repository: ecrStack.productServiceRepository,
  vpc: vpcStack.vpc,
});

productsServiceStack.addDependency(clusterStack);
productsServiceStack.addDependency(lbStack);
productsServiceStack.addDependency(ecrStack);
productsServiceStack.addDependency(vpcStack);

const apiStack = new ApiStack(app, "Api", {
  tags: tagsInfra,
  env,
  alb: lbStack.alb,
});

apiStack.addDependency(lbStack);
apiStack.addDependency(productsServiceStack);
