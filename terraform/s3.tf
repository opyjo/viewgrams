resource "aws_s3_bucket" "diagrams" {
  bucket = "${var.app_name}-${var.environment}-diagrams"
}

resource "aws_s3_bucket_public_access_block" "diagrams" {
  bucket = aws_s3_bucket.diagrams.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "diagrams" {
  bucket = aws_s3_bucket.diagrams.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
