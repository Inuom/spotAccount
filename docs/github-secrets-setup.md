# GitHub Secrets Setup for CI/CD Pipeline

## Required Secrets

The following secrets need to be configured in your GitHub repository:

### AWS Credentials
- `AWS_ACCESS_KEY_ID`: AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for deployment

### Terraform Backend
- `TERRAFORM_BACKEND_BUCKET`: S3 bucket name for Terraform state storage
- `TERRAFORM_BACKEND_DYNAMODB_TABLE`: DynamoDB table name for state locking

### Application Secrets
- `DATABASE_URL`: PostgreSQL connection string (encrypted)
- `JWT_SECRET`: JWT signing secret (encrypted)
- `ECR_REGISTRY`: ECR repository URL

## Setup Instructions

### 1. Access Repository Settings

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"

### 2. Add Repository Secrets

For each secret listed above:

1. Click "New repository secret"
2. Enter the secret name (exactly as listed above)
3. Enter the secret value
4. Click "Add secret"

### 3. Secret Values

#### AWS_ACCESS_KEY_ID
```
AKIA... (from AWS IAM user access key)
```

#### AWS_SECRET_ACCESS_KEY
```
... (from AWS IAM user secret key)
```

#### TERRAFORM_BACKEND_BUCKET
```
spotaccount-terraform-state-prod
```

#### TERRAFORM_BACKEND_DYNAMODB_TABLE
```
spotaccount-terraform-locks
```

#### DATABASE_URL
```
postgresql://username:password@rds-endpoint:5432/database_name
```

#### JWT_SECRET
```
your-super-secret-jwt-key-here
```

#### ECR_REGISTRY
```
123456789012.dkr.ecr.us-east-1.amazonaws.com
```

## Verification

After adding all secrets:

1. Go to "Actions" tab in your repository
2. Click on "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Check that the workflow can access the secrets

## Security Best Practices

- Use strong, unique values for all secrets
- Rotate secrets regularly
- Never commit secrets to version control
- Use environment-specific secrets when possible
- Monitor secret usage in GitHub Actions logs

## Troubleshooting

### Common Issues

1. **Secret not found**: Ensure the secret name matches exactly (case-sensitive)
2. **Access denied**: Check AWS IAM permissions for the access key
3. **Invalid format**: Verify secret values are properly formatted

### Testing Secrets

You can test if secrets are accessible by adding a step to your workflow:

```yaml
- name: Test secrets access
  run: |
    echo "AWS_ACCESS_KEY_ID is set: ${{ secrets.AWS_ACCESS_KEY_ID != '' }}"
    echo "DATABASE_URL is set: ${{ secrets.DATABASE_URL != '' }}"
    # Don't echo the actual values for security
```

## Next Steps

After setting up all secrets:

1. Test the CI/CD pipeline with a test commit
2. Verify AWS resources are created correctly
3. Check that applications can connect to the database
4. Validate that deployments work end-to-end
