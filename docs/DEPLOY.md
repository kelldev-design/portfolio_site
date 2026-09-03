# Deploying portfolio_site

## Production topology

```
kelldev.design  ->  CloudFront E310RTA2TDL598  ->  S3 bucket kelldev.design
```

The site is a static bundle. `npm run build` (`tsc && vite build`) emits `dist/`,
which is synced wholesale into the bucket. CloudFront serves it; there is no
server-side rendering and no compute in the request path.

The API the site talks to lives in the sibling repo `portfolio_api` and is
reached at `https://api.kelldev.design/`.

AWS account `003149845291`, region `us-east-1`.

## Deploying

Push to `main`. `.github/workflows/deploy.yml` then:

1. checks out and builds with Node 20,
2. assumes the `portfolio-site-github-deploy` IAM role via GitHub OIDC (no stored
   AWS keys),
3. runs `aws s3 sync dist/ s3://kelldev.design --delete`,
4. creates a `/*` CloudFront invalidation and waits for it to complete, so the job
   does not report success before the cache is actually cleared.

Deploys are serialised by the `deploy-production` concurrency group and are not
cancelled in flight. The workflow can also be run manually via
`workflow_dispatch`.

Pull requests and pushes to `main` additionally run `.github/workflows/ci.yml`:
lint (eslint without `--fix`), typecheck (`tsc --noEmit`), and build.

## One-time activation

The deploy workflow is guarded by `if: vars.AWS_DEPLOY_ROLE_ARN != ''` and does
nothing until two steps have been done:

1. Apply the Terraform module that creates the deploy role:

   ```sh
   cd deploy/terraform
   terraform init
   terraform apply
   ```

   This needs an AdministratorAccess profile in account `003149845291`
   (`kelldev-mgmt` by default). See `deploy/terraform/README.md`.

2. Set the role ARN as a repository variable:

   ```sh
   gh variable set AWS_DEPLOY_ROLE_ARN \
     --repo kelldev-design/portfolio_site \
     --body "$(terraform output -raw github_deploy_role_arn)"
   ```

Nothing in the workflow files needs editing to switch deploys on.

## Manual fallback

The original manual path still works from a laptop holding credentials for the
`portfolio-site-deploy` IAM user:

```sh
npm run build
npm run aws:deploy   # aws:sync + aws:invalidate
```

`aws:invalidate` does not wait for the invalidation to finish; the CLI returns as
soon as CloudFront accepts it.

## Build-time configuration

`.env.production` sets `VITE_PORTFOIO_API_URL` (the misspelling is intentional and
load-bearing — application code reads that exact name). Vite inlines it into the
bundle at build time, so changing the API host is not a runtime or CloudFront
config change: edit `.env.production`, rebuild, and redeploy.
