import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
  aws_ecr as ecr,
  aws_apigatewayv2 as apigateway,
  aws_apigatewayv2_integrations as integrations,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface ApiStackProps extends StackProps {
  alb: elbv2.ApplicationLoadBalancer;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create security group for VPC Link
    const vpcLinkSecurityGroup = new ec2.SecurityGroup(
      this,
      "VpcLinkSecurityGroup",
      {
        vpc: props.alb.vpc!,
        description: "Security group for VPC Link to communicate with ALB",
        allowAllOutbound: false,
      },
    );

    // Allow VPC Link to send traffic to ALB on port 8080
    vpcLinkSecurityGroup.addEgressRule(
      ec2.Peer.securityGroupId(
        props.alb.connections.securityGroups[0].securityGroupId,
      ),
      ec2.Port.tcp(8080),
      "Allow outbound traffic to ALB",
    );

    const vpcLink = new apigateway.VpcLink(this, "VpcLink", {
      vpc: props.alb.vpc!,
      securityGroups: [vpcLinkSecurityGroup],
    });

    const httpApi = new apigateway.HttpApi(this, "HttpApi", {
      apiName: "ECommerceHttpApi",
    });

    this.createProductsResource(httpApi, props, vpcLink);
  }

  private createProductsResource(
    httpApi: apigateway.HttpApi,
    props: ApiStackProps,
    vpcLink: apigateway.VpcLink,
  ) {
    const productsResource = httpApi.addRoutes({
      path: "/products",
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpAlbIntegration(
        "ProductsServiceALBIntegration",
        props.alb.listeners[0],
        {
          vpcLink,
          parameterMapping: new apigateway.ParameterMapping().overwritePath(
            apigateway.MappingValue.requestPath(),
          ),
        },
      ),
    });
  }
}
