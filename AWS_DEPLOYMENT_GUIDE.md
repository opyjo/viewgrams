# AWS Manual Deployment Guide for Mermaid Viewer

A complete step-by-step guide to deploy your Mermaid diagram application to AWS.

## Table of Contents
1. [What You're Building](#what-youre-building)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create DynamoDB Table](#step-1-create-dynamodb-table)
4. [Step 2: Set Up Cognito Authentication](#step-2-set-up-cognito-authentication)
5. [Step 3: Create AppSync GraphQL API](#step-3-create-appsync-graphql-api)
6. [Step 4: Connect Your Next.js App](#step-4-connect-your-nextjs-app)
7. [Step 5: Test Everything](#step-5-test-everything)
8. [Troubleshooting](#troubleshooting)

---

## What You're Building

Your application will use four AWS services:

1. **DynamoDB** - A database that stores your Mermaid diagrams
   - Think of it like a spreadsheet in the cloud that's super fast
   - Each user's diagrams are stored with their user ID

2. **Cognito** - Handles user login and authentication
   - Manages user accounts (sign up, login, passwords)
   - Protects your API so only logged-in users can access their diagrams

3. **AppSync** - Your GraphQL API (the bridge between your app and database)
   - Lets your app ask for data using GraphQL queries
   - Automatically connects to DynamoDB and checks user authentication

4. **S3** - Stores uploaded diagram assets (SVG + Mermaid source)
   - Keeps rendered assets alongside the metadata stored in DynamoDB

**How they work together:**
```
Your Next.js App → Cognito (login) → AppSync API → DynamoDB (data)
                                  ↘ S3 (assets)
```

---

## Prerequisites

- An AWS Account (free tier is fine)
- AWS Console access
- 30-45 minutes of time

**Costs:** Everything we create uses free tier. You shouldn't be charged anything for learning/testing.

---

## Step 1: Create DynamoDB Table

DynamoDB is where your diagrams will be stored.

### 1.1 Go to DynamoDB

1. Open the [AWS Console](https://console.aws.amazon.com)
2. In the search bar at the top, type **"DynamoDB"**
3. Click on **DynamoDB** service
4. Make sure you're in the **us-east-2** region (check top-right corner, change if needed)

### 1.2 Create the Table

1. Click the orange **"Create table"** button

2. Fill in these settings:

   **Table details:**
   - **Table name:** `mermaidviewer-dev-diagrams`
   - **Partition key:** `userId` (leave as String)
   - **Sort key:** Click "Add sort key", enter `id` (leave as String)

   > **What are these keys?**
   > - `userId`: Groups diagrams by user (like folders)
   > - `id`: Unique identifier for each diagram (like file names)
   > - Together they let you quickly find "all diagrams for user X"

3. **Table settings:**
   - Select **"On-demand"** (you only pay for what you use)

4. **Tags** (optional but helpful):
   - Key: `Name`, Value: `mermaidviewer-diagrams-table`
   - Key: `Environment`, Value: `dev`

5. Leave everything else as default

6. Click **"Create table"** (bottom right)

7. Wait 20-30 seconds for the table to be created (status shows "Active")

### 1.3 Save Important Info

Once created, you'll see your table details. Save this info:
- **Table name:** `mermaidviewer-dev-diagrams`
- **ARN:** (looks like `arn:aws:dynamodb:us-east-2:123456789:table/mermaidviewer-dev-diagrams`)
  - Find this in the "General information" section
  - Copy it to a notepad - you'll need it later

---

## Step 2: Set Up Cognito Authentication

Cognito manages your users and their logins.

### 2.1 Go to Cognito

1. In the AWS Console search bar, type **"Cognito"**
2. Click on **Amazon Cognito**
3. Verify you're still in **us-east-2** region

### 2.2 Create User Pool

1. Click **"Create user pool"** button

### 2.3 Configure Sign-in Experience

**Step 1 of 6: Sign-in experience**

1. **Cognito user pool sign-in options:**
   - Check **"Email"** (users will log in with email)
   - Uncheck everything else

2. **Multi-factor authentication:**
   - Select **"No MFA"** (keep it simple for learning)

3. Click **"Next"**

### 2.4 Configure Security Requirements

**Step 2 of 6: Security requirements**

1. **Password policy:**
   - Select **"Cognito defaults"**
   - Or if you want custom, set:
     - Minimum length: 8
     - Check: lowercase, uppercase, numbers, special characters

2. **Multi-factor authentication:**
   - Leave as **"No MFA"**

3. **User account recovery:**
   - Select **"Email only"**

4. Click **"Next"**

### 2.5 Configure Sign-up Experience

**Step 3 of 6: Sign-up experience**

1. **Self-service sign-up:**
   - Check **"Enable self-registration"**

2. **Attribute verification:**
   - Select **"Send email message, verify email address"**

3. **Required attributes:**
   - Leave as default (only email)

4. Click **"Next"**

### 2.6 Configure Message Delivery

**Step 4 of 6: Message delivery**

1. **Email provider:**
   - Select **"Send email with Cognito"** (easiest for learning)
   - This lets you send up to 50 emails/day for free

2. **FROM email address:**
   - Leave as default (`no-reply@verificationemail.com`)

3. Click **"Next"**

### 2.7 Integrate Your App

**Step 5 of 6: Integrate your app**

1. **User pool name:**
   - Enter: `mermaidviewer-dev-user-pool`

2. **Hosted authentication pages:**
   - Leave **unchecked** (we'll build our own login page)

3. **Domain:**
   - Select **"Use a Cognito domain"**
   - Enter: `mermaidviewer-dev-YOUR_NAME` (replace YOUR_NAME with something unique)
   - Example: `mermaidviewer-dev-john123`
   - Click "Check availability" to verify it's available
   - If taken, add more numbers

4. **Initial app client:**
   - **App client name:** `mermaidviewer-dev-client`
   - **Client secret:** Select **"Don't generate a client secret"**
   - **Authentication flows:** Check these:
     - ✅ ALLOW_USER_PASSWORD_AUTH
     - ✅ ALLOW_REFRESH_TOKEN_AUTH
     - ✅ ALLOW_USER_SRP_AUTH

5. Click **"Next"**

### 2.8 Review and Create

**Step 6 of 6: Review and create**

1. Review all your settings
2. Scroll to bottom and click **"Create user pool"**
3. Wait 10-20 seconds for creation

### 2.9 Save Important Info

Once created, you'll see your User Pool page. Save these values:

1. **User pool ID:** (looks like `us-east-2_AbCdEfGhI`)
   - Find in "User pool overview" at the top
   - Copy to notepad

2. **ARN:** (looks like `arn:aws:cognito-idp:us-east-2:123456789:userpool/us-east-2_AbCdEfGhI`)
   - Also in "User pool overview"
   - Copy to notepad

3. Go to the **"App integration"** tab at the top

4. Scroll down to **"App clients and analytics"**

5. Click on your app client name (`mermaidviewer-dev-client`)

6. **Client ID:** (looks like `1a2b3c4d5e6f7g8h9i0j1k2l`)
   - Copy to notepad

7. **Cognito domain:** (looks like `mermaidviewer-dev-john123.auth.us-east-2.amazoncognito.com`)
   - Go back and click "App integration" tab
   - Find "Domain" section at the top
   - Copy the full domain to notepad

---

## Step 3: Create AppSync GraphQL API

AppSync is your GraphQL API that connects everything together.

### 3.1 Go to AppSync

1. In AWS Console search bar, type **"AppSync"**
2. Click on **AWS AppSync**
3. Verify you're in **us-east-2** region

### 3.2 Create API

1. Click **"Create API"** button

2. Choose **"Design from scratch"**

3. Click **"Next"**

4. **API name:** `mermaidviewer-dev-api`

5. Click **"Create"**

### 3.3 Configure Authentication

1. Once created, you'll be on the API page

2. On the left sidebar, click **"Settings"**

3. Scroll to **"Authorization modes"**

4. For **"Default authorization mode":**
   - Click **"Edit"**
   - Authorization mode: Select **"Amazon Cognito User Pool"**
   - AWS Region: **us-east-2**
   - User pool ID: Paste your Cognito User Pool ID (from Step 2.9)
   - Default action: **Allow**
   - Click **"Save"**

### 3.4 Define Schema

1. On the left sidebar, click **"Schema"**

2. You'll see a text editor. **Delete everything** in it

3. Copy and paste this exact schema:

```graphql
type Diagram {
  id: ID!
  userId: String!
  title: String!
  content: String!
  createdAt: String!
  updatedAt: String!
}

type Query {
  getDiagram(id: ID!): Diagram
  listDiagrams: [Diagram]
  searchDiagrams(query: String!): [Diagram]
}

type Mutation {
  createDiagram(title: String!, content: String!): Diagram
  updateDiagram(id: ID!, title: String, content: String): Diagram
  deleteDiagram(id: ID!): Diagram
}

type Subscription {
  onCreateDiagram: Diagram
    @aws_subscribe(mutations: ["createDiagram"])
  onUpdateDiagram: Diagram
    @aws_subscribe(mutations: ["updateDiagram"])
  onDeleteDiagram: Diagram
    @aws_subscribe(mutations: ["deleteDiagram"])
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```

4. Click **"Save Schema"** at the top right

> **What is this schema?**
> It defines what data your app can request and modify:
> - **Diagram**: The structure of a diagram (id, title, content, etc.)
> - **Query**: Ways to READ data (get one, list all, search)
> - **Mutation**: Ways to CHANGE data (create, update, delete)
> - **Subscription**: Real-time updates when data changes

### 3.5 Create DynamoDB Data Source

1. On the left sidebar, click **"Data sources"**

2. Click **"Create data source"**

3. **Data source name:** `DiagramsTable`

4. **Data source type:** Select **"Amazon DynamoDB table"**

5. **Region:** us-east-2

6. **Table name:** Select `mermaidviewer-dev-diagrams` from dropdown

7. **Create or use an existing role:**
   - Select **"Create new role"**
   - Role name will auto-fill: `AppSyncServiceRole-mermaidviewer...` (keep it)

8. Click **"Create"**

### 3.6 Create "None" Data Source (for Subscriptions)

1. Still on **"Data sources"** page, click **"Create data source"** again

2. **Data source name:** `NoneDataSource`

3. **Data source type:** Select **"None"**

4. Click **"Create"**

> **Why "None"?** Subscriptions don't query data directly. They just pass through events when mutations happen.

### 3.7 Create Resolvers

Resolvers connect your GraphQL operations to DynamoDB.

#### 3.7.1 getDiagram Resolver

1. On the left sidebar, click **"Resolvers"**

2. Find the **"Query"** section

3. Click on **"getDiagram"**

4. Click **"Attach resolver"** on the right

5. **Data source:** Select `DiagramsTable`

6. **Request mapping template:** Delete everything and paste:

```vtl
{
  "version": "2017-02-28",
  "operation": "GetItem",
  "key": {
    "userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
    "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
  }
}
```

7. **Response mapping template:** Delete everything and paste:

```vtl
$util.toJson($ctx.result)
```

8. Click **"Save resolver"**

#### 3.7.2 listDiagrams Resolver

1. Find **"Query"** section again

2. Click on **"listDiagrams"**

3. Click **"Attach resolver"**

4. **Data source:** `DiagramsTable`

5. **Request mapping template:**

```vtl
{
  "version": "2017-02-28",
  "operation": "Query",
  "query": {
    "expression": "userId = :userId",
    "expressionValues": {
      ":userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub)
    }
  }
}
```

6. **Response mapping template:**

```vtl
$util.toJson($ctx.result.items)
```

7. Click **"Save resolver"**

#### 3.7.3 searchDiagrams Resolver

1. Click on **"searchDiagrams"** in Query section

2. Click **"Attach resolver"**

3. **Data source:** `DiagramsTable`

4. **Request mapping template:**

```vtl
{
  "version": "2017-02-28",
  "operation": "Query",
  "query": {
    "expression": "userId = :userId",
    "expressionValues": {
      ":userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub)
    }
  },
  "filter": {
    "expression": "contains(title, :query) OR contains(content, :query)",
    "expressionValues": {
      ":query": $util.dynamodb.toDynamoDBJson($ctx.args.query)
    }
  }
}
```

5. **Response mapping template:**

```vtl
$util.toJson($ctx.result.items)
```

6. Click **"Save resolver"**

#### 3.7.4 createDiagram Resolver

1. Find **"Mutation"** section (below Query)

2. Click on **"createDiagram"**

3. Click **"Attach resolver"**

4. **Data source:** `DiagramsTable`

5. **Request mapping template:**

```vtl
#set($id = $util.autoId())
#set($timestamp = $util.time.nowISO8601())
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
    "userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
    "id": $util.dynamodb.toDynamoDBJson($id)
  },
  "attributeValues": {
    "title": $util.dynamodb.toDynamoDBJson($ctx.args.title),
    "content": $util.dynamodb.toDynamoDBJson($ctx.args.content),
    "createdAt": $util.dynamodb.toDynamoDBJson($timestamp),
    "updatedAt": $util.dynamodb.toDynamoDBJson($timestamp)
  }
}
```

6. **Response mapping template:**

```vtl
$util.toJson($ctx.result)
```

7. Click **"Save resolver"**

#### 3.7.5 updateDiagram Resolver

1. Click on **"updateDiagram"** in Mutation section

2. Click **"Attach resolver"**

3. **Data source:** `DiagramsTable`

4. **Request mapping template:**

```vtl
#set($timestamp = $util.time.nowISO8601())
{
  "version": "2017-02-28",
  "operation": "UpdateItem",
  "key": {
    "userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
    "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
  },
  "update": {
    "expression": "SET #title = :title, #content = :content, updatedAt = :updatedAt",
    "expressionNames": {
      "#title": "title",
      "#content": "content"
    },
    "expressionValues": {
      ":title": $util.dynamodb.toDynamoDBJson($ctx.args.title),
      ":content": $util.dynamodb.toDynamoDBJson($ctx.args.content),
      ":updatedAt": $util.dynamodb.toDynamoDBJson($timestamp)
    }
  }
}
```

5. **Response mapping template:**

```vtl
$util.toJson($ctx.result)
```

6. Click **"Save resolver"**

#### 3.7.6 deleteDiagram Resolver

1. Click on **"deleteDiagram"** in Mutation section

2. Click **"Attach resolver"**

3. **Data source:** `DiagramsTable`

4. **Request mapping template:**

```vtl
{
  "version": "2017-02-28",
  "operation": "DeleteItem",
  "key": {
    "userId": $util.dynamodb.toDynamoDBJson($ctx.identity.sub),
    "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
  }
}
```

5. **Response mapping template:**

```vtl
$util.toJson($ctx.result)
```

6. Click **"Save resolver"**

#### 3.7.7 Subscription Resolvers

For each subscription (onCreateDiagram, onUpdateDiagram, onDeleteDiagram):

1. Find **"Subscription"** section

2. Click on the subscription name

3. Click **"Attach resolver"**

4. **Data source:** `NoneDataSource`

5. **Request mapping template:**

```vtl
{
  "version": "2017-02-28",
  "payload": {}
}
```

6. **Response mapping template:**

```vtl
$util.toJson($ctx.result)
```

7. Click **"Save resolver"**

8. **Repeat for all 3 subscriptions**

### 3.8 Save API Information

1. On the left sidebar, click **"Settings"**

2. Find and copy these values to your notepad:

   - **API URL:** (looks like `https://abc123.appsync-api.us-east-2.amazonaws.com/graphql`)
   - **API ID:** (looks like `abc123xyz`)

---

## Step 4: Connect Your Next.js App

Now let's connect your application to AWS.

### 4.1 Update Apollo Client Configuration

1. Open your project in your code editor

2. Open the file `lib/appsync-client.ts`

3. The file currently looks like this (with API key auth):

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const URL = process.env.NEXT_PUBLIC_APPSYNC_URL;
const API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

const httpLink = createHttpLink({
    uri: URL || 'http://localhost:4000/graphql',
    headers: {
        'x-api-key': API_KEY || '',
    },
});

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
```

4. We need to change it to use **Cognito authentication** instead. Replace the entire file with:

```typescript
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const URL = process.env.NEXT_PUBLIC_APPSYNC_URL;

const httpLink = createHttpLink({
    uri: URL || 'http://localhost:4000/graphql',
});

// Add Cognito authentication token to requests
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from localStorage if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('cognito_token') : null;

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        }
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});
```

> **What changed?**
> - Removed API key authentication
> - Added Cognito token authentication
> - Tokens will be stored in browser localStorage after login

### 4.2 Install Additional Dependencies

The authentication setup needs one more package:

```bash
npm install @apollo/client@latest
```

### 4.3 Create Environment Variables File

1. In your project root directory, create a file named `.env.local`

2. Add these values (replace with YOUR actual values from earlier):

```bash
# AppSync API
NEXT_PUBLIC_APPSYNC_URL=https://YOUR_API_ID.appsync-api.us-east-2.amazonaws.com/graphql

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-2_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_COGNITO_REGION=us-east-2

# S3 (server-side uploads)
AWS_REGION=us-east-2
AWS_S3_BUCKET=your_bucket_name
```

**Example with fake values:**
```bash
NEXT_PUBLIC_APPSYNC_URL=https://abc123xyz.appsync-api.us-east-2.amazonaws.com/graphql
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-2_AbCdEfGhI
NEXT_PUBLIC_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l
NEXT_PUBLIC_COGNITO_REGION=us-east-2
AWS_REGION=us-east-2
AWS_S3_BUCKET=mermaidviewer-dev-diagrams
```

3. Save the file

> **Note:** The Next.js server needs AWS credentials that can upload to this bucket.
> For local dev, set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your environment.

4. **Important:** Restart your development server:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### 4.4 Create Authentication Utilities

Create a new file `lib/auth.ts` to handle Cognito login/signup:

```typescript
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

export const signUp = (email: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const signIn = (email: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const authenticationData = {
      Username: email,
      Password: password,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        localStorage.setItem('cognito_token', token);
        resolve(token);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  localStorage.removeItem('cognito_token');
};

export const getCurrentUser = (): Promise<CognitoUser | null> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: any) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(cognitoUser);
    });
  });
};
```

### 4.5 Install Cognito SDK

```bash
npm install amazon-cognito-identity-js
```

---

## Step 5: Test Everything

### 5.1 Test AppSync API in AWS Console

1. Go to AppSync in AWS Console

2. Click on your API (`mermaidviewer-dev-api`)

3. On the left sidebar, click **"Queries"**

4. You'll see a GraphQL playground

5. First, you need to login. Click **"Login with User Pools"** at the top

6. **Problem:** You don't have a user yet! Let's create one:

### 5.2 Create a Test User in Cognito

1. Go to **Cognito** in AWS Console

2. Click on your user pool (`mermaidviewer-dev-user-pool`)

3. Click **"Users"** tab

4. Click **"Create user"**

5. Fill in:
   - **User name:** your.email@example.com
   - **Email:** your.email@example.com
   - **Temporary password:** TempPass123! (you'll change this)
   - Uncheck "Mark email as verified" checkbox
   - Check "Mark email as verified"

6. Click **"Create user"**

### 5.3 Test a Query

1. Go back to AppSync → Queries

2. Try this query:

```graphql
query ListMyDiagrams {
  listDiagrams {
    id
    title
    content
    createdAt
  }
}
```

3. Click the orange **Play** button

4. You should get an empty array: `{ "data": { "listDiagrams": [] } }`

5. This is good! It means it's working (you just don't have diagrams yet)

### 5.4 Test Creating a Diagram

1. Try this mutation:

```graphql
mutation CreateDiagram {
  createDiagram(
    title: "My First Diagram"
    content: "graph TD\n  A[Start] --> B[End]"
  ) {
    id
    title
    content
    createdAt
  }
}
```

2. Click **Play**

3. You should get back the created diagram with an ID

4. Now run the listDiagrams query again - you should see your diagram!

### 5.5 Test Your Next.js App

1. Make sure your dev server is running: `npm run dev`

2. Open http://localhost:3000

3. You should see your app

4. Try creating a diagram - it should save to DynamoDB!

---

## Troubleshooting

### Problem: "Unauthorized" errors in AppSync

**Solution:**
- Make sure you're logged in when testing in the Queries console
- Check that your Cognito User Pool ID is correct in AppSync settings
- Verify the user exists in Cognito

### Problem: App can't connect to AppSync

**Solution:**
- Check `.env.local` file has correct values
- Restart your dev server after changing `.env.local`
- Check browser console for specific errors
- Verify AppSync URL is correct (should end with `/graphql`)

### Problem: CORS errors

**Solution:**
1. Go to AppSync → Settings
2. Add `http://localhost:3000` to allowed origins

### Problem: "Token expired" errors

**Solution:**
- Cognito tokens expire after 1 hour
- Log out and log back in
- Or implement token refresh (advanced)

### Problem: DynamoDB items not showing

**Solution:**
- Go to DynamoDB → Tables → your table → "Explore table items"
- Check if items exist
- Verify userId and id are being set correctly
- Check resolver request/response mapping templates

### Problem: Can't create user in Cognito

**Solution:**
- Check password meets requirements (8+ chars, upper, lower, number, symbol)
- Verify email format is valid
- Try a different email address

---

## Next Steps

Once everything is working:

1. **Add more features:**
   - User profile page
   - Diagram sharing
   - Diagram categories/tags

2. **Deploy your Next.js app:**
   - Use Vercel (easiest)
   - Use AWS Amplify
   - Use AWS App Runner

3. **Explore AWS Console:**
   - Check DynamoDB to see your stored diagrams
   - Monitor CloudWatch logs
   - View Cognito user activity

4. **Learn more:**
   - Try modifying the GraphQL schema
   - Add new query types
   - Implement pagination for large diagram lists

---

## Cost Estimates

All services used are in AWS Free Tier:

- **DynamoDB:** 25 GB storage, 200M requests/month free
- **Cognito:** 50,000 monthly active users free
- **AppSync:** 250,000 requests/month free

For learning and personal projects, you should stay well within free tier limits.

---

## Summary

You've successfully:
- ✅ Created a DynamoDB table to store diagrams
- ✅ Set up Cognito for user authentication
- ✅ Built an AppSync GraphQL API
- ✅ Connected your Next.js app to AWS
- ✅ Learned how AWS services work together

**Congratulations!** 🎉 You now have a fully functional serverless application on AWS!
