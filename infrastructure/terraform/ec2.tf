# EC2 Instance Configuration
# Feature: simplify-aws-to-ec2

# Get the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Elastic IP for static public IP
resource "aws_eip" "main" {
  domain = "vpc"

  tags = merge(var.common_tags, {
    Name    = "${var.project_name}-${var.environment}-eip"
    Purpose = "static-ip"
  })
}

# Associate Elastic IP with EC2 instance
resource "aws_eip_association" "main" {
  instance_id   = aws_instance.main.id
  allocation_id = aws_eip.main.id
}

# EC2 Instance
resource "aws_instance" "main" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.ec2_instance_type

  # Use default VPC's default subnet
  subnet_id                   = data.aws_subnet.default.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  associate_public_ip_address = true

  # IAM role for EC2 (optional, for future use with ECR, CloudWatch, etc.)
  iam_instance_profile = aws_iam_instance_profile.ec2.name

  # User data script to install Docker and Docker Compose
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    project_name = var.project_name
    environment  = var.environment
  }))

  # Root volume configuration
  root_block_device {
    volume_size           = var.ec2_root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = merge(var.common_tags, {
      Name = "${var.project_name}-${var.environment}-root-volume"
    })
  }

  # Enable detailed monitoring
  monitoring = true

  # Enable termination protection for production
  disable_api_termination = var.environment == "production" ? true : false

  tags = merge(var.common_tags, {
    Name    = "${var.project_name}-${var.environment}-ec2"
    Purpose = "application-server"
  })

  lifecycle {
    ignore_changes = [
      user_data,
      ami
    ]
  }
}

# Get default VPC
data "aws_vpc" "default" {
  default = true
}

# Get default subnet in the first availability zone
data "aws_subnet" "default" {
  vpc_id            = data.aws_vpc.default.id
  availability_zone = data.aws_availability_zones.available.names[0]
  default_for_az    = true
}

