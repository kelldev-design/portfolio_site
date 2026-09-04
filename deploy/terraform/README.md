# deploy/terraform

Provisions the GitHub Actions deploy role for this repository.

## What it creates

- `aws_iam_role.portfolio-site-github-deploy` — assumable only via GitHub OIDC, and
  only by `kelldev-design/portfolio_site` on `refs/heads/main`.
- An inline least-privilege policy on that role: list the site bucket, put/get/delete
  objects in it, and create/read CloudFront invalidations for the site distribution.

That is the whole module. Nothing else is managed here.

## What it does NOT manage

- The S3 bucket `kelldev.design` and the CloudFront distribution `E310RTA2TDL598`
  predate this module. They are referenced by name and id only; this module grants
  access to them, it does not own them.
- The IAM OIDC provider for `token.actions.githubusercontent.com`. It already exists
  in account `003149845291`, created by the `portfolio_api` Terraform module. AWS
  allows only one provider per URL per account, so it is read here with a data
  source. Creating a second one will fail the apply.

## Prerequisites

- The state bucket `kelldev-portfolio-tfstate-003149845291` and lock table
  `kelldev-portfolio-tflock` exist (created by `portfolio_api`'s module).
- The OIDC provider above exists.
- An AWS profile with AdministratorAccess in account `003149845291`: `kelldev-mgmt`,
  named both by `var.aws_profile` (for the provider) and literally in the `backend "s3"`
  block, since backends cannot read variables. Sign in with
  `aws sso login --profile kelldev-mgmt` before applying. The scoped
  `portfolio-site-deploy` user is S3/CloudFront-only and cannot apply this module.

## Apply

```sh
cd deploy/terraform
terraform init
terraform apply
```

## After applying

Take the `github_deploy_role_arn` output and set it as a GitHub **repository
variable** named `AWS_DEPLOY_ROLE_ARN`:

```sh
gh variable set AWS_DEPLOY_ROLE_ARN \
  --repo kelldev-design/portfolio_site \
  --body "$(terraform output -raw github_deploy_role_arn)"
```

`.github/workflows/deploy.yml` is guarded by `if: vars.AWS_DEPLOY_ROLE_ARN != ''`,
so it stays inert until that variable is set. No workflow edit is needed to
activate it.
