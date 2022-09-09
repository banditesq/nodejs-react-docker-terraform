
terraform {
  required_version = ">= 0.13"
}
provider "aws" {
  version = "~> 3.0"
  region  = "eu-west-2" # Setting my region to London. Use your own region here
  access_key = "xxx"
  secret_key = "xxx"
}
resource "aws_ecr_repository" "app" {
  name = "app" # Naming my repository
}
resource "aws_ecr_repository_policy" "foopolicy" {
  repository = aws_ecr_repository.app.name

  policy = <<EOF
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "new policy",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:DescribeRepositories",
                "ecr:GetRepositoryPolicy",
                "ecr:ListImages",
                "ecr:DeleteRepository",
                "ecr:BatchDeleteImage",
                "ecr:SetRepositoryPolicy",
                "ecr:DeleteRepositoryPolicy"
            ]
        }
    ]
}
EOF
}
resource "aws_ecs_cluster" "app_cluster" {
  name = "app-cluster" # Naming the cluster
}


data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = "${aws_iam_role.ecsTaskExecutionRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_vpc" "my_vpc" {
      cidr_block = "10.0.1.0/24"

}
resource "aws_internet_gateway" "internet_gateway" {
    vpc_id = aws_vpc.my_vpc.id
}

# Providing a reference to our default subnets
resource "aws_subnet" "default_subnet_a" {
  vpc_id     = aws_vpc.my_vpc.id
  cidr_block = "10.0.1.0/24" 
  map_public_ip_on_launch = true

}
resource "aws_route_table" "public" {
    vpc_id = aws_vpc.my_vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.internet_gateway.id
    }
}


resource "aws_route_table_association" "route_table_association" {
    subnet_id      = aws_subnet.default_subnet_a.id
    route_table_id = aws_route_table.public.id
}


resource "aws_security_group" "ecs_sg" {
    vpc_id      = aws_vpc.my_vpc.id

    ingress {
        from_port       = 22
        to_port         = 22
        protocol        = "tcp"
        cidr_blocks     = ["0.0.0.0/0"]
    }
    ingress {
        from_port       = 8000
        to_port         = 8000
        protocol        = "tcp"
        cidr_blocks     = ["0.0.0.0/0"]
    }

    egress {
        from_port       = 0
        to_port         = 65535
        protocol        = "tcp"
        cidr_blocks     = ["0.0.0.0/0"]
    }
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "app-task" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "backend-task",
      "image": "${aws_ecr_repository.app.repository_url}:backend",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "hostPort": 8080
        }
      ],
      "memory": 512,
      "cpu": 256
    },
     {
      "name": "front-task",
      "image": "${aws_ecr_repository.app.repository_url}:front",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "memory": 512,
      "cpu": 256
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 1024         # Specifying the memory our container requires
  cpu                      = 512         # Specifying the CPU our container requires
  execution_role_arn       = "${aws_iam_role.ecsTaskExecutionRole.arn}"
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole2"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role_policy.json}"
}

resource "aws_ecs_service" "my_first_service" {
  name            = "my-first-service"                             # Naming our first service
  cluster         = "${aws_ecs_cluster.app_cluster.id}"             # Referencing our created Cluster
  task_definition = "${aws_ecs_task_definition.app_task.arn}" # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1 # Setting the number of containers we want deployed to 1
    network_configuration {
    subnets          = ["${aws_subnet.default_subnet_a.id}"]
    security_groups = ["${aws_security_group.ecs_sg.id}"]
    assign_public_ip = true # Providing our containers with public IPs
  }
}
