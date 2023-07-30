# Pennywhistle Pizza Web API

## Deployment Guidelines

The ExpressJS API is deployed on AWS Fargate using AWS Copilot.

Before you deploy, it's important to ensure that you have added the following:

- An IAM User.

The IAM User should have the following IAM Policy:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1690741472001",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:ConditionCheckItem",
        "dynamodb:CreateTable",
        "dynamodb:DeleteItem",
        "dynamodb:DeleteTable",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

- Next, create a set of Secret Access Keys and Access Key for the IAM User that will be used for the app

- Next, ensure that you have Docker, AWS CLI Installed.

  - Docker: https://docs.docker.com/engine/install/
  - AWS CLI: `curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg" && sudo installer -pkg AWSCLIV2.pkg -target /`

- The Dockerfile present at the root will be used for deployment.

If you want to run the app locally through Docker, use the following commands:

```
docker build -t penny-whistle-web-api .

docker images | grep penny-whistle-web-api

docker run -p 3000:3000 -d penny-whistle-web-api
```

- Next, before deploying to AWS Fargate using AWS Copilot, run `node dynamodb.js` to provision the DynamoDB Tables. If you wish to update the region, make sure to update the region in `dynamodb.js` and `.env`.
