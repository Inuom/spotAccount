# CloudWatch Log Groups
# Feature: 002-cicd-aws-terraform

# CloudWatch Log Group for Application
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-logs"
    Environment = var.environment
    Purpose     = "application-logs"
  }
}

# CloudWatch Log Group for ECS Tasks
resource "aws_cloudwatch_log_group" "ecs_tasks" {
  name              = "/aws/ecs/${var.project_name}-${var.environment}-tasks"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-tasks-logs"
    Environment = var.environment
    Purpose     = "ecs-task-logs"
  }
}

# CloudWatch Log Group for Load Balancer
resource "aws_cloudwatch_log_group" "alb" {
  name              = "/aws/applicationloadbalancer/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-logs"
    Environment = var.environment
    Purpose     = "alb-logs"
  }
}

# CloudWatch Log Group for RDS
resource "aws_cloudwatch_log_group" "rds" {
  name              = "/aws/rds/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-logs"
    Environment = var.environment
    Purpose     = "rds-logs"
  }
}

# CloudWatch Log Stream for Application
resource "aws_cloudwatch_log_stream" "app" {
  name           = "${var.project_name}-${var.environment}-app-stream"
  log_group_name = aws_cloudwatch_log_group.app.name
}

# CloudWatch Log Stream for ECS Tasks
resource "aws_cloudwatch_log_stream" "ecs_tasks" {
  name           = "${var.project_name}-${var.environment}-ecs-tasks-stream"
  log_group_name = aws_cloudwatch_log_group.ecs_tasks.name
}
