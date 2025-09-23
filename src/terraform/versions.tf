terraform {
  backend "s3" {
    # Substitua pelos outputs do bootstrap
    bucket         = "biblioteca-terraform-2"
    key            = "biblioteca-terraform-2/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "livros-lock-state"
    encrypt        = true
  }


  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
      Repository  = "REPO_NAME"
    }
  }
}