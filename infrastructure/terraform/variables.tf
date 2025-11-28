# Terraform variables for EC2-based Hosting
# Feature: simplify-aws-to-ec2

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
  default     = "eu-west-1"
}

# EC2 Configuration
variable "ec2_instance_type" {
  description = "EC2 instance type (t3.micro or t3.small recommended)"
  type        = string
  default     = "t3.micro"
}

variable "ec2_root_volume_size" {
  description = "Size of EC2 root volume in GB"
  type        = number
  default     = 30
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
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

# GitHub Configuration
variable "github_repository" {
  description = "GitHub repository for CI/CD (format: owner/repo)"
  type        = string
  default     = "Inuom/spotaccount"
}

# Tags
variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
