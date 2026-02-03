variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "mermaidviewer"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
