terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Same state bucket and lock table as the portfolio_api module, different key
  # so the two states do not collide.
  backend "s3" {
    bucket         = "kelldev-portfolio-tfstate-003149845291"
    key            = "portfolio-site/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "kelldev-portfolio-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region  = var.region
  profile = var.aws_profile
}
