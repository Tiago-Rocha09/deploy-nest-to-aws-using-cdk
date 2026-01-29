import { Stack, StackProps, RemovalPolicy, aws_ecr as ecr } from "aws-cdk-lib";
import { Construct } from "constructs";

export class EcrStack extends Stack {
  readonly productServiceRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.productServiceRepository = new ecr.Repository(
      this,
      "ProductsService",
      {
        repositoryName: "products-service",
        imageTagMutability: ecr.TagMutability.IMMUTABLE,
        emptyOnDelete: true,
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );
  }
}
