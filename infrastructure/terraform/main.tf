# Main Terraform configuration for CICD and AWS Hosting
# Feature: 002-cicd-aws-terraform

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    # Backend configuration will be set via terraform init -backend-config
    # This allows for dynamic backend configuration
    # region will be provided via -backend-config or environment variables
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Feature     = "002-cicd-aws-terraform"
    }
  }
}

# Data sources for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "./vpc-module"
  
  vpc_cidr                = var.vpc_cidr
  public_subnet_cidrs     = var.public_subnet_cidrs
  private_subnet_cidrs    = var.private_subnet_cidrs
  availability_zones      = data.aws_availability_zones.available.names
  common_tags            = var.common_tags
  project_name           = var.project_name
  environment           = var.environment
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Data source for current AWS region
data "aws_region" "current" {}
