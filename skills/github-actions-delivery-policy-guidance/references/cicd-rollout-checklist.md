# CI/CD Rollout Checklist

Use this checklist when designing GitHub Actions beyond a simple CI pipeline.

## Lifecycle

- Which workflows are PR validation only?
- Which workflows are deployment workflows?
- Is there a clear promotion path between environments?

## Security

- Are `permissions` minimal at workflow and job scope?
- Are environment secrets separated from build-time secrets?
- Are manual approvals or protection rules defined where needed?

## Artifacts

- What is a cache versus a deployment artifact?
- Can the deployment reuse a built artifact instead of rebuilding?
- Are retention and download expectations explicit?

## Failure and Rollback

- What stops a deployment?
- What evidence is kept for failure analysis?
- How is rollback triggered and what artifact or version does it use?
