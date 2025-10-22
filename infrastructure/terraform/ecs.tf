# ECS Cluster and Service Configuration
# Feature: 002-cicd-aws-terraform

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.ecs_cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.common_tags, {
    Name        = var.ecs_cluster_name
    Purpose     = "application-cluster"
  })
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = "${var.project_name}-${var.environment}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "${var.project_name}-${var.environment}-container"
      image = "${aws_ecr_repository.backend.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = var.app_port
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = tostring(var.app_port)
        }
      ]
      
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_ssm_parameter.database_url.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_tasks.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      
      essential = true
    }
  ])

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-task"
    Purpose     = "application-task"
  })
}

# ECS Service
resource "aws_ecs_service" "main" {
  name            = var.ecs_service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "${var.project_name}-${var.environment}-container"
    container_port   = var.app_port
  }

  depends_on = [
    aws_lb_listener.main,
    aws_iam_role_policy_attachment.ecs_task_execution
  ]

  tags = merge(var.common_tags, {
    Name        = var.ecs_service_name
    Purpose     = "application-service"
  })
}

# SSM Parameter for Database URL
resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project_name}/${var.environment}/database/url"
  type  = "SecureString"
  value = "postgresql://${aws_db_instance.main.username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-database-url"
    Purpose     = "database-connection"
  })
}

# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}
