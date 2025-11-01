# CloudFront Distribution for Frontend
# Feature: 002-cicd-aws-terraform

# CloudFront Origin Access Control
##resource "aws_cloudfront_origin_access_control" "frontend" {
##  name                              = "${var.project_name}-${var.environment}-oac"
##  description                       = "OAC for ${var.project_name} frontend"
##  origin_access_control_origin_type  = "s3"
##  signing_behavior                  = "always"
##  signing_protocol                  = "sigv4"
##}
##
### CloudFront Distribution resource for the frontend S3 bucket
##resource "aws_cloudfront_distribution" "frontend" {
##  # Origin configuration pointing to the frontend S3 bucket, using Origin Access Control
##  origin {
##    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
##    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
##    origin_id                = "S3-${aws_s3_bucket.frontend.bucket}"
##  }
##
##  # Enable the distribution and IPv6 support
##  enabled         = true
##  is_ipv6_enabled = true
##
##  # Comment for distribution identification in the AWS Console
##  comment             = "${var.project_name} ${var.environment} frontend distribution"
##  default_root_object = "index.html"
##
##  # Default cache behavior for all requests that don't match an ordered cache behavior
##  default_cache_behavior {
##    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
##    cached_methods         = ["GET", "HEAD"]
##    target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
##    compress               = true
##    viewer_protocol_policy = "redirect-to-https"
##
##    # Forward only basic requests; cookies and query strings are not forwarded
##    forwarded_values {
##      query_string = false
##      cookies {
##        forward = "none"
##      }
##    }
##
##    # TTLs for how long objects stay in cache (in seconds)
##    min_ttl     = 0
##    default_ttl = 3600
##    max_ttl     = 86400
##  }
##
##  # Cache behavior for static assets
##  ordered_cache_behavior {
##    path_pattern     = "/assets/*"
##    allowed_methods = ["GET", "HEAD", "OPTIONS"]
##    cached_methods  = ["GET", "HEAD", "OPTIONS"]
##    target_origin_id = "S3-${aws_s3_bucket.frontend.bucket}"
##    viewer_protocol_policy = "redirect-to-https"
##
##    forwarded_values {
##      query_string = false
##      cookies {
##        forward = "none"
##      }
##    }
##
##    min_ttl     = 0
##    default_ttl = 86400
##    max_ttl     = 31536000
##    compress    = true
##  }
##
##  # Error pages
##  custom_error_response {
##    error_code         = 404
##    response_code      = 200
##    response_page_path = "/index.html"
##  }
##
##  custom_error_response {
##    error_code         = 403
##    response_code      = 200
##    response_page_path = "/index.html"
##  }
##
##  price_class = var.cloudfront_price_class
##
##  restrictions {
##    geo_restriction {
##      restriction_type = "none"
##    }
##  }
##
##  viewer_certificate {
##    cloudfront_default_certificate = true
##  }
##
##  tags = merge(var.common_tags, {
##    Name        = "${var.project_name}-${var.environment}-cloudfront"
##    Purpose     = "frontend-distribution"
##  })
##}
##
### Update S3 bucket policy to allow CloudFront access
##resource "aws_s3_bucket_policy" "cloudfront_access" {
##  bucket = aws_s3_bucket.frontend.id
##
##  policy = jsonencode({
##    Version = "2012-10-17"
##    Statement = [
##      {
##        Sid    = "AllowCloudFrontServicePrincipal"
##        Effect = "Allow"
##        Principal = {
##          Service = "cloudfront.amazonaws.com"
##        }
##        Action   = "s3:GetObject"
##        Resource = "${aws_s3_bucket.frontend.arn}/*"
##        Condition = {
##          StringEquals = {
##            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
##          }
##        }
##      }
##    ]
##  })
##
##  depends_on = [aws_cloudfront_distribution.frontend]
##}
