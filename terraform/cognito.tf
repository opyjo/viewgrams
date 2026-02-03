resource "aws_cognito_user_pool" "main" {
  name = "${var.app_name}-${var.environment}-user-pool"

  password_policy {
    minimum_length = 8
    require_lowercase = true
    require_numbers = true
    require_symbols = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "frontend" {
  name = "${var.app_name}-${var.environment}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.app_name}-${var.environment}-${random_string.suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}
