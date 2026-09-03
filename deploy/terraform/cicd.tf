# GitHub Actions deploy role.
#
# Intent: a single IAM role that only this repository's `main` branch can assume,
# via GitHub's OIDC provider, and whose only power is to publish the built site
# and invalidate the CDN cache in front of it. No long-lived AWS access keys are
# stored in GitHub; the workflow exchanges its OIDC token for short-lived
# credentials on each run.
#
# The OIDC provider for token.actions.githubusercontent.com already exists in
# account 003149845291 — it was created by the portfolio_api Terraform module.
# AWS permits only one provider per URL per account, so this module looks it up
# with a data source rather than creating a second one.

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "github_deploy_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "portfolio-site-github-deploy"
  description        = "Assumed by GitHub Actions on ${var.github_repo} main to publish the static site."
  assume_role_policy = data.aws_iam_policy_document.github_deploy_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid       = "ListBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.bucket_name}"]
  }

  statement {
    sid    = "WriteObjects"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObject",
    ]
    resources = ["arn:aws:s3:::${var.bucket_name}/*"]
  }

  statement {
    sid    = "Invalidate"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
    ]
    resources = [
      "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${var.distribution_id}",
    ]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "portfolio-site-deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}
