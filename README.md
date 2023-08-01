# Pennywhistle Pizza Web API

The application is deployed on: http://penny-Publi-1G36I2FQTT6YP-696116164.us-east-1.elb.amazonaws.com

## Setup

- Clone repository
- Run `npm install` to install required dependencies
- Run `npm run start` to launch dev server.
- Visit `localhost:3000` to see API in action.

## Users

There is a pre-registered administrator:

- Email: lakinduhewa@gmail.com
- Password: Test@1234

Visit the `/docs` endpoint and Authenticate with it to consume admin features.

## Testing

- Unit/ Integration tests have been implemented using Jest + Superfetch.
- To run the tests, run `npm run test`

## Deployment Guidelines

The API is deployed on AWS Fargate using AWS Copilot.

- Ensure that you have Docker, AWS Copilot, AWS CLI Installed.

  - Docker: https://docs.docker.com/engine/install/
  - AWS Copilot: `brew install aws/tap/copilot-cli`
  - AWS CLI: `curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg" && sudo installer -pkg AWSCLIV2.pkg -target /` and configure a profile.

- The Dockerfile present at the root will be used for deployment.

If you want to run the app locally through Docker, use the following commands:

```
docker build -t penny-whistle-web-api .

docker images | grep penny-whistle-web-api

docker run -p 3000:3000 -d penny-whistle-web-api
```

- Ensure Docker is up and running before the deployment.

- Open the folder `./scripts/terminal` in your terminal. Then run `node dynamodb.js && node insert-sample-data.js` to provision the DynamoDB Tables. Leave the region in Mumbai (ap-south-1).

- Next, initialize Copilot using `copilot init` and input following:

  - App Name: `web-api`
  - Workload type: `Load Balanced Web Service`
  - Service name - `api`
  - Dockerfile - `./Dockerfile`
  - Deploy test environment - `N`

- Next, initialize an environment using `copilot env init`

  - Name: `test`
  - AWS Profile: Your configured profile
  - Default Configs: `Yes, use default.`

- Open the `copilot/api/manifest.yml` and update the memory and CPU to the following:

```
cpu: 4096
memory: 8192

variables: # Pass environment variables as key value pairs.
  LOG_LEVEL: info
  AWS_REGION: ap-south-1 (or your region)
  AWS_USER_TABLE_NAME: users
  AWS_PRODUCT_TABLE_NAME: products
  AWS_ORDER_TABLE_NAME: orders
  APP_PORT: 3000
  JWT_SECRET: 123456789789798172398127897asd9a8s7da89s7da89s7dasdacdascdasdcsadcascds1a1c1a2d1as2dc1sa2cd1sa2

```

- Next, create a new directory inside `./copilot/api` called `addons` and create a file called `iam.yml`. This will be used to define the IAM Policy needed for the app to work.

- Next, add the following config to the `iam.yml`:

```
# You can use any of these parameters to create conditions or mappings in your template.
Parameters:
  App:
    Type: String
    Description: Your application's name.
  Env:
    Type: String
    Description: The environment name your service, job, or workflow is being deployed to.
  Name:
    Type: String
    Description: The name of the service, job, or workflow being deployed.

Resources:
  PennyWhistleAPIDynamoAccessRole:
    Type: AWS::IAM::ManagedPolicy
    Properties:
      PolicyDocument:
        Version: 2012-10-17
        Statement:
          - Sid: DDBActions
            Effect: Allow
            Action:
              - dynamodb:BatchGet*
              - dynamodb:Get*
              - dynamodb:Query
              - dynamodb:Scan
              - dynamodb:BatchWrite*
              - dynamodb:Create*
              - dynamodb:Delete*
              - dynamodb:Update*
              - dynamodb:PutItem
            Resource:
              - "*"
          - Sid: PutMetrics
            Effect: Allow
            Action:
              - cloudwatch:PutMetricData
            Resource: "*"
          - Sid: XRayPutSegments
            Effect: Allow
            Action:
              - xray:PutTraceSegments
            Resource: "*"

Outputs:
  PennyWhistleAPIDynamoAccessRoleArn:
    Description: "The ARN of the ManagedPolicy to attach to the task role."
    Value: !Ref PennyWhistleAPIDynamoAccessRole

```

- Next deploy the environment: `copilot env deploy --name test`

- Next, run the command `copilot deploy` to deploy the app.

- To delete your deployment, run `copilot app delete`
