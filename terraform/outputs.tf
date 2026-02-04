output "aws_region" {
  value = var.aws_region
}

output "appsync_url" {
  value = aws_appsync_graphql_api.diagrams.uris["GRAPHQL"]
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.frontend.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.diagrams.bucket
}
