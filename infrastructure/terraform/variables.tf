# Terraform variables for CICD and AWS Hosting
# Feature: 002-cicd-aws-terraform

# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "spotaccount"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# AWS Configuration
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

# availability_zones is now derived from data.aws_availability_zones.available.names

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# ECS Configuration
variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "spotaccount-cluster"
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
  default     = "spotaccount-service"
}

variable "ecs_task_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 256
}

variable "ecs_task_memory" {
  description = "Memory for ECS task"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS"
  type        = number
  default     = 100
}

variable "db_backup_retention_period" {
  description = "Backup retention period for RDS"
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "Backup window for RDS"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Maintenance window for RDS"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# S3 Configuration
variable "s3_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
  default     = ""
}

# CloudFront Configuration
variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

# Application Configuration
variable "app_port" {
  description = "Port for the application"
  type        = number
  default     = 3000
}

variable "app_health_check_path" {
  description = "Health check path for the application"
  type        = string
  default     = "/healthz"
}

# Tags
variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
