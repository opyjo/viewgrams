resource "aws_dynamodb_table" "diagrams" {
  name           = "${var.app_name}-${var.environment}-diagrams"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "id"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "projectId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserProjectIndex"
    hash_key        = "userId"
    range_key       = "projectId"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.app_name}-diagrams-table"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "projects" {
  name           = "${var.app_name}-${var.environment}-projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "projectId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "projectId"
    type = "S"
  }

  tags = {
    Name        = "${var.app_name}-projects-table"
    Environment = var.environment
  }
}
