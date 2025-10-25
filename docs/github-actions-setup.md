# GitHub Actions Setup Guide

**Last Updated**: 2025-01-22  
**Purpose**: Configure GitHub Actions secrets for CI/CD pipeline

## Required Secrets

The CI/CD pipeline requires the following secrets to be configured in your GitHub repository:

### AWS Credentials

Navigate to **Settings > Secrets and variables > Actions > New repository secret** and add:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `TERRAFORM_BACKEND_BUCKET` | S3 bucket for Terraform state | `spotaccount-terraform-state` |
| `TERRAFORM_BACKEND_DYNAMODB_TABLE` | DynamoDB table for state locking | `spotaccount-terraform-locks` |

### Database Credentials

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DATABASE_PASSWORD` | RDS PostgreSQL password | `SecureP@ssw0rd123!` |
| `DATABASE_URL` | Full database connection string | `postgresql://admin:password@rds-endpoint:5432/spotaccount` |

### Application Configuration

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-change-this` |
| `STRIPE_SECRET_KEY` | Stripe API secret key (if applicable) | `sk_test_...` |

## Setup Instructions

### 1. Create AWS IAM User

```bash
# Create IAM user for GitHub Actions
aws iam create-user --user-name github-actions-spotaccount

# Attach required policies
aws iam attach-user-policy \
  --user-name github-actions-spotaccount \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-user-policy \
  --user-name github-actions-spotaccount \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-user-policy \
  --user-name github-actions-spotaccount \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name github-actions-spotaccount \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

# Create access key
aws iam create-access-key --user-name github-actions-spotaccount
```

**Note**: Save the `AccessKeyId` and `SecretAccessKey` from the output.

### 2. Create Terraform Backend Resources

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket spotaccount-terraform-state \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket spotaccount-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name spotaccount-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add each secret from the tables above

#### Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Set secrets
gh secret set AWS_ACCESS_KEY_ID --body "YOUR_ACCESS_KEY_ID"
gh secret set AWS_SECRET_ACCESS_KEY --body "YOUR_SECRET_ACCESS_KEY"
gh secret set TERRAFORM_BACKEND_BUCKET --body "spotaccount-terraform-state"
gh secret set TERRAFORM_BACKEND_DYNAMODB_TABLE --body "spotaccount-terraform-locks"
gh secret set DATABASE_PASSWORD --body "YOUR_DATABASE_PASSWORD"
gh secret set JWT_SECRET --body "YOUR_JWT_SECRET"
```

### 4. Verify Configuration

After configuring secrets, verify by:

1. Pushing a commit to trigger the CI/CD pipeline
2. Check GitHub Actions tab for pipeline execution
3. Verify all steps pass without authentication errors

```bash
git add .
git commit -m "chore: test CI/CD pipeline"
git push origin master
```

## Security Best Practices

1. **Rotate Credentials Regularly**: Change AWS access keys every 90 days
2. **Use Least Privilege**: Only grant necessary IAM permissions
3. **Never Commit Secrets**: Always use GitHub Secrets, never hardcode
4. **Enable MFA**: Enable MFA for AWS IAM users with admin access
5. **Monitor Usage**: Set up CloudTrail to monitor API usage
6. **Separate Environments**: Use different AWS accounts for production/staging

## IAM Policy Reference

Minimal IAM policy for GitHub Actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::spotaccount-terraform-state",
        "arn:aws:s3:::spotaccount-terraform-state/*",
        "arn:aws:s3:::spotaccount-frontend-*",
        "arn:aws:s3:::spotaccount-frontend-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/spotaccount-terraform-locks"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## Troubleshooting

### "Invalid AWS Credentials" Error

1. Verify secrets are correctly set in GitHub
2. Check IAM user has necessary permissions
3. Ensure access key is active and not expired

### "Access Denied to S3 Bucket" Error

1. Verify bucket exists in correct region
2. Check IAM policy includes S3 permissions
3. Ensure bucket policy allows IAM user access

### "DynamoDB Table Not Found" Error

1. Verify table exists in correct region
2. Check table name matches secret value
3. Ensure IAM user has DynamoDB permissions

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Terraform Backend Configuration](https://www.terraform.io/docs/language/settings/backends/s3.html)

