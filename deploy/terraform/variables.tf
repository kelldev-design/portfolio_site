variable "region" {
  description = "AWS region for the provider and for the deploy role."
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AdministratorAccess profile in account 003149845291. The `default` profile is the scoped portfolio-site-deploy user and cannot apply this."
  type        = string
  default     = "kelldev-mgmt"
}

variable "github_repo" {
  description = "owner/repo allowed to assume the deploy role via OIDC, main branch only."
  type        = string
  default     = "kelldev-design/portfolio_site"
}

variable "bucket_name" {
  description = "Existing S3 bucket serving the static site. Not managed by this module."
  type        = string
  default     = "kelldev.design"
}

variable "distribution_id" {
  description = "Existing CloudFront distribution in front of the site bucket. Not managed by this module."
  type        = string
  default     = "E310RTA2TDL598"
}

variable "tags" {
  description = "Tags applied to resources created by this module."
  type        = map(string)
  default = {
    app       = "portfolio-site"
    managedBy = "terraform"
  }
}
