# AppSync GraphQL API
resource "aws_appsync_graphql_api" "diagrams" {
  name                = "${var.app_name}-${var.environment}-api"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"

  user_pool_config {
    aws_region     = var.aws_region
    default_action = "ALLOW"
    user_pool_id   = aws_cognito_user_pool.main.id
  }

  schema = file("${path.module}/schema.graphql")

  tags = {
    Name = "${var.app_name}-graphql-api"
  }
}

# IAM Role for AppSync to access DynamoDB
resource "aws_iam_role" "appsync_dynamodb" {
  name = "${var.app_name}-${var.environment}-appsync-dynamodb"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "appsync_dynamodb" {
  name = "${var.app_name}-${var.environment}-appsync-dynamodb-policy"
  role = aws_iam_role.appsync_dynamodb.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.diagrams.arn,
          "${aws_dynamodb_table.diagrams.arn}/index/*",
          aws_dynamodb_table.projects.arn,
          "${aws_dynamodb_table.projects.arn}/index/*"
        ]
      }
    ]
  })
}

# DynamoDB Data Source
resource "aws_appsync_datasource" "diagrams" {
  api_id           = aws_appsync_graphql_api.diagrams.id
  name             = "DiagramsTable"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_dynamodb.arn

  dynamodb_config {
    table_name = aws_dynamodb_table.diagrams.name
    region     = var.aws_region
  }
}

# Projects Data Source
resource "aws_appsync_datasource" "projects" {
  api_id           = aws_appsync_graphql_api.diagrams.id
  name             = "ProjectsTable"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_dynamodb.arn

  dynamodb_config {
    table_name = aws_dynamodb_table.projects.name
    region     = var.aws_region
  }
}

# NONE data source for subscriptions
resource "aws_appsync_datasource" "none" {
  api_id = aws_appsync_graphql_api.diagrams.id
  name   = "NoneDataSource"
  type   = "NONE"
}

# ==================== RESOLVERS ====================

# Query: getDiagram
resource "aws_appsync_resolver" "get_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Query"
  field       = "getDiagram"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Query.getDiagram.req.vtl")
  response_template = file("${path.module}/resolvers/Query.getDiagram.res.vtl")
}

# Query: listDiagrams
resource "aws_appsync_resolver" "list_diagrams" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Query"
  field       = "listDiagrams"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Query.listDiagrams.req.vtl")
  response_template = file("${path.module}/resolvers/Query.listDiagrams.res.vtl")
}

# Query: searchDiagrams
resource "aws_appsync_resolver" "search_diagrams" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Query"
  field       = "searchDiagrams"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Query.searchDiagrams.req.vtl")
  response_template = file("${path.module}/resolvers/Query.searchDiagrams.res.vtl")
}

# Mutation: createDiagram
resource "aws_appsync_resolver" "create_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "createDiagram"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Mutation.createDiagram.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.createDiagram.res.vtl")
}

# Mutation: updateDiagram
resource "aws_appsync_resolver" "update_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "updateDiagram"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Mutation.updateDiagram.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.updateDiagram.res.vtl")
}

# Mutation: deleteDiagram
resource "aws_appsync_resolver" "delete_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "deleteDiagram"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Mutation.deleteDiagram.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.deleteDiagram.res.vtl")
}

# Subscription: onCreateDiagram
resource "aws_appsync_resolver" "on_create_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Subscription"
  field       = "onCreateDiagram"
  data_source = aws_appsync_datasource.none.name

  request_template  = file("${path.module}/resolvers/Subscription.req.vtl")
  response_template = file("${path.module}/resolvers/Subscription.res.vtl")
}

# Subscription: onUpdateDiagram
resource "aws_appsync_resolver" "on_update_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Subscription"
  field       = "onUpdateDiagram"
  data_source = aws_appsync_datasource.none.name

  request_template  = file("${path.module}/resolvers/Subscription.req.vtl")
  response_template = file("${path.module}/resolvers/Subscription.res.vtl")
}

# Subscription: onDeleteDiagram
resource "aws_appsync_resolver" "on_delete_diagram" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Subscription"
  field       = "onDeleteDiagram"
  data_source = aws_appsync_datasource.none.name

  request_template  = file("${path.module}/resolvers/Subscription.req.vtl")
  response_template = file("${path.module}/resolvers/Subscription.res.vtl")
}

# ==================== PROJECT RESOLVERS ====================

# Query: getProject
resource "aws_appsync_resolver" "get_project" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Query"
  field       = "getProject"
  data_source = aws_appsync_datasource.projects.name

  request_template  = file("${path.module}/resolvers/Query.getProject.req.vtl")
  response_template = file("${path.module}/resolvers/Query.getProject.res.vtl")
}

# Query: listProjects
resource "aws_appsync_resolver" "list_projects" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Query"
  field       = "listProjects"
  data_source = aws_appsync_datasource.projects.name

  request_template  = file("${path.module}/resolvers/Query.listProjects.req.vtl")
  response_template = file("${path.module}/resolvers/Query.listProjects.res.vtl")
}

# Mutation: createProject
resource "aws_appsync_resolver" "create_project" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "createProject"
  data_source = aws_appsync_datasource.projects.name

  request_template  = file("${path.module}/resolvers/Mutation.createProject.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.createProject.res.vtl")
}

# Mutation: updateProject
resource "aws_appsync_resolver" "update_project" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "updateProject"
  data_source = aws_appsync_datasource.projects.name

  request_template  = file("${path.module}/resolvers/Mutation.updateProject.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.updateProject.res.vtl")
}

# Mutation: deleteProject
resource "aws_appsync_resolver" "delete_project" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "deleteProject"
  data_source = aws_appsync_datasource.projects.name

  request_template  = file("${path.module}/resolvers/Mutation.deleteProject.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.deleteProject.res.vtl")
}

# Mutation: moveAllDiagramsToUncategorized
resource "aws_appsync_resolver" "move_all_diagrams_to_uncategorized" {
  api_id      = aws_appsync_graphql_api.diagrams.id
  type        = "Mutation"
  field       = "moveAllDiagramsToUncategorized"
  data_source = aws_appsync_datasource.diagrams.name

  request_template  = file("${path.module}/resolvers/Mutation.moveAllDiagramsToUncategorized.req.vtl")
  response_template = file("${path.module}/resolvers/Mutation.moveAllDiagramsToUncategorized.res.vtl")
}
