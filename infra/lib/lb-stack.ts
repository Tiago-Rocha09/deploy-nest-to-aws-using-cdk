import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface LbStackProps extends StackProps {
  vpc: ec2.Vpc;
}

export class LoadBalancerStack extends Stack {
  readonly nlb: elbv2.NetworkLoadBalancer;
  readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: LbStackProps) {
    super(scope, id, props);

    this.nlb = new elbv2.NetworkLoadBalancer(this, "ECommerceNLB", {
      vpc: props.vpc,
      loadBalancerName: "ECommerceNLB",
      internetFacing: false,
    });

    this.alb = new elbv2.ApplicationLoadBalancer(this, "ECommerceALB", {
      vpc: props.vpc,
      loadBalancerName: "ECommerceALB",
      internetFacing: false,
    });
  }
}
