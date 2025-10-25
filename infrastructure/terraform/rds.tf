# RDS Database Configuration
# Feature: 002-cicd-aws-terraform

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Purpose     = "database-subnet-group"
  })
}

# Create a new subnet group for the transition
resource "aws_db_subnet_group" "main_new" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group-new"
  subnet_ids = module.vpc.public_subnets

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group-new"
    Purpose     = "database-subnet-group-new"
  })
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  # Engine Configuration
  engine         = "postgres"
  engine_version = "15.14"
  instance_class = var.db_instance_class

  # Storage Configuration
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage  = var.db_max_allocated_storage
  storage_type          = "gp2"
  storage_encrypted     = true

  # Database Configuration
  db_name  = "${var.project_name}_${var.environment}"
  username = "postgres"
  password = random_password.db_password.result
  port     = 5432

  # Network Configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true
  
  # Backup Configuration
  backup_retention_period = var.db_backup_retention_period
  backup_window          = var.db_backup_window
  maintenance_window     = var.db_maintenance_window
  delete_automated_backups = true

  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn

  # Performance Insights
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  # Deletion Protection
  deletion_protection = false
  skip_final_snapshot = true

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-db"
    Purpose     = "application-database"
  })
}

# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${var.project_name}-${var.environment}-rds-enhanced-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-rds-enhanced-monitoring-role"
    Purpose     = "rds-monitoring"
  })
}

# Attach AWS managed policy for RDS enhanced monitoring
resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
