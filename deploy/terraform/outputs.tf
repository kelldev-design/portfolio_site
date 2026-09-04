output "github_deploy_role_arn" {
  description = "ARN of the GitHub Actions deploy role. Set this as the GitHub repo variable AWS_DEPLOY_ROLE_ARN to activate .github/workflows/deploy.yml."
  value       = aws_iam_role.github_deploy.arn
}
