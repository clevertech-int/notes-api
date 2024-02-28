resource "aws_ecr_repository" "notes_api_dev" {
  force_delete         = true
  name                 = "notes_api_dev"
}

resource "aws_vpc" "notes_api_dev" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = {
    Name = "notes_api_dev"
  }
}

resource "aws_internet_gateway" "notes_api_dev" {
  vpc_id = aws_vpc.notes_api_dev.id
  tags   = {
    Name = "notes_api_dev"
  }
}

resource "aws_subnet" "notes_api_dev" {
  vpc_id            = aws_vpc.notes_api_dev.id
  availability_zone = "us-east-1a"
  cidr_block        = "10.0.1.0/24"
}

resource "aws_subnet" "notes_api_dev_b" {
  vpc_id            = aws_vpc.notes_api_dev.id
  availability_zone = "us-east-1b"
  cidr_block        = "10.0.2.0/24"
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.notes_api_dev.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.notes_api_dev.id
  }
}

resource "aws_route_table_association" "notes_api_dev" {
  subnet_id      = aws_subnet.notes_api_dev.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "notes_api_dev_b" {
  subnet_id      = aws_subnet.notes_api_dev_b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_ecs_cluster" "notes_api_dev" {
  name = "notes_api_dev"
}

resource "aws_security_group" "notes_api_dev" {
  vpc_id = aws_vpc.notes_api_dev.id
  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "notes_api_dev_b" {
  vpc_id = aws_vpc.notes_api_dev.id
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_route53_zone" "dev_domain" {
  name = "clevertech.dev"
}

resource "aws_route53_record" "notes_api_dev" {
  zone_id    = data.aws_route53_zone.dev_domain.zone_id
  name       = "notes-api-dev.${data.aws_route53_zone.dev_domain.name}"
  type       = "A"
  depends_on = [aws_alb.notes_api_dev]

  alias {
    name                   = aws_alb.notes_api_dev.dns_name
    zone_id                = aws_alb.notes_api_dev.zone_id
    evaluate_target_health = false
  }
}


resource "aws_lb_target_group" "notes_api_dev" {
  name        = "notesapidev"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.notes_api_dev.id

  health_check {
    matcher = "200,301,302"
    path    = "/health"
  }
}

resource "aws_alb" "notes_api_dev" {
  name               = "notesapidev"
  load_balancer_type = "application"
  subnets            = [
    "${aws_subnet.notes_api_dev.id}",
    "${aws_subnet.notes_api_dev_b.id}",
  ]
  security_groups = [aws_security_group.notes_api_dev.id]
}

resource "aws_lb_listener" "notes_api_dev" {
  load_balancer_arn = aws_alb.notes_api_dev.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:us-east-1:520473259663:certificate/992951fc-1442-46ed-baf5-931113d47e1d"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.notes_api_dev.arn
  }
}

data "aws_iam_policy_document" "notes_api_dev" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "notes_api_dev" {
  name               = "notes_api_dev"
  assume_role_policy = data.aws_iam_policy_document.notes_api_dev.json
}

resource "aws_iam_role_policy_attachment" "notes_api_dev" {
  role       = aws_iam_role.notes_api_dev.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_log_group" "notes_api_dev" {
  name              = "/fargate/service/notes_api_dev"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "notes_api_dev" {
  family                   = "notes_api_dev"
  container_definitions    = <<DEFINITION
  [
    {
      "name": "notes_api_dev",
      "image": "${aws_ecr_repository.notes_api_dev.repository_url}:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "memory": 512,
      "cpu": 256,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.notes_api_dev.name}",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "APP_PORT",
          "value": "3000"
        },
        {
          "name": "REDIS_CLOUD_URL",
          "value": "redis://default:7cBVjcnuq2cDcmxV7JAKtXpjEobxSTDf@redis-18661.c326.us-east-1-3.ec2.cloud.redislabs.com:18661"
        }
      ]
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 512
  cpu                      = 256
  execution_role_arn       = aws_iam_role.notes_api_dev.arn
}

resource "aws_ecs_service" "notes_api_dev" {
  name                 = "notes_api_dev"
  cluster              = aws_ecs_cluster.notes_api_dev.id
  task_definition      = aws_ecs_task_definition.notes_api_dev.arn
  desired_count        = 1
  force_new_deployment = true
  launch_type          = "FARGATE"

  load_balancer {
    target_group_arn = aws_lb_target_group.notes_api_dev.arn
    container_name   = aws_ecs_task_definition.notes_api_dev.family
    container_port   = 3000
  }

  network_configuration {
    subnets = [
      aws_subnet.notes_api_dev.id,
      aws_subnet.notes_api_dev_b.id,
    ]
    assign_public_ip = true
    security_groups  = [aws_security_group.notes_api_dev.id]
  }
}
