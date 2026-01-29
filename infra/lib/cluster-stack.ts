import { Stack, StackProps, aws_ecs as ecs, aws_ec2 as ec2 } from "aws-cdk-lib";
import { ContainerInsights } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

interface ClusterStackProps extends StackProps {
  vpc: ec2.Vpc;
}

export class ClusterStack extends Stack {
  readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    this.cluster = new ecs.Cluster(this, "ECommerceCluster", {
      vpc: props.vpc,
      clusterName: "ECommerce",
      containerInsightsV2: ContainerInsights.ENABLED,
    });
  }
}
