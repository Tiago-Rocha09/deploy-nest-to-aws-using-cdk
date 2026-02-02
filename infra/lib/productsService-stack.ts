import {
  Stack,
  StackProps,
  RemovalPolicy,
  aws_ecs as ecs,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
  aws_ecr as ecr,
  aws_logs as logs,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface ProductsServiceStackProps extends StackProps {
  vpc: ec2.Vpc;
  cluster: ecs.Cluster;
  alb: elbv2.ApplicationLoadBalancer;
  nlb: elbv2.NetworkLoadBalancer;
  repository: ecr.Repository;
}

export class ProductsServiceStack extends Stack {
  readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: ProductsServiceStackProps) {
    super(scope, id, props);

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
        family: "products-service",
      },
    );

    const logDriver = ecs.LogDriver.awsLogs({
      logGroup: new logs.LogGroup(this, "LogGroup", {
        logGroupName: "ProductsService",
        removalPolicy: RemovalPolicy.DESTROY,
        retention: logs.RetentionDays.ONE_MONTH,
      }),
      streamPrefix: "productsService",
    });

    taskDefinition.addContainer("ProductsServiceContainer", {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, "1.0.0"),
      containerName: "productsService",
      portMappings: [{ containerPort: 8080, protocol: ecs.Protocol.TCP }],
      logging: logDriver,
    });

    const albListener = props.alb.addListener("ProductsServiceALBListener", {
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: true,
    });

    const service = new ecs.FargateService(this, "ProductsService", {
      serviceName: "ProductsService",
      cluster: props.cluster,
      taskDefinition,
      desiredCount: 2,
    });

    props.repository.grantPull(taskDefinition.taskRole);

    service.connections.securityGroups[0].addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(8080),
    );

    albListener.addTargets("ProductsServiceALBTarget", {
      targetGroupName: "productsServiceALB",
      port: 8080,
      targets: [service],
      protocol: elbv2.ApplicationProtocol.HTTP,
      deregistrationDelay: Duration.seconds(30),
      healthCheck: {
        interval: Duration.seconds(30),
        enabled: true,
        port: "8080",
        timeout: Duration.seconds(10),
        path: "/health",
      },
    });

    const nlbListener = props.nlb.addListener("ProductsServiceNLBListener", {
      port: 8080,
      protocol: elbv2.Protocol.TCP,
    });

    nlbListener.addTargets("ProductsServiceNLBTarget", {
      targetGroupName: "productsServiceNLB",
      port: 8080,
      protocol: elbv2.Protocol.TCP,
      targets: [
        service.loadBalancerTarget({
          containerName: "productsService",
          containerPort: 8080,
          protocol: ecs.Protocol.TCP,
        }),
      ],
      healthCheck: {
        protocol: elbv2.Protocol.HTTP,
        path: "/health",
        port: "8080",
        interval: Duration.seconds(30),
        timeout: Duration.seconds(10),
        healthyThresholdCount: 3,
        unhealthyThresholdCount: 3,
      },
    });
  }
}
