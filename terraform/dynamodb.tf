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

  tags = {
    Name        = "${var.app_name}-diagrams-table"
    Environment = var.environment
  }
}
