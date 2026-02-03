# viewgrams

A modern Mermaid diagram viewer and editor built with Next.js and AWS.

## Features

- Create and edit Mermaid diagrams
- Real-time diagram rendering
- Save diagrams to AWS (DynamoDB)
- User authentication with AWS Cognito
- GraphQL API with AWS AppSync

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Diagrams:** Mermaid.js
- **Backend:** AWS AppSync (GraphQL)
- **Database:** AWS DynamoDB
- **Authentication:** AWS Cognito
- **Infrastructure:** Terraform/OpenTofu

## Getting Started

### Prerequisites

- Node.js 20+
- AWS Account
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/opyjo/viewgrams.git
cd viewgrams
```

2. Install dependencies:
```bash
npm install
```

3. Set up AWS infrastructure (see `AWS_DEPLOYMENT_GUIDE.md`)

4. Create `.env.local` file:
```bash
NEXT_PUBLIC_APPSYNC_URL=your_appsync_url
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=us-east-2
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## AWS Deployment

Follow the comprehensive guide in `AWS_DEPLOYMENT_GUIDE.md` for step-by-step instructions to:
- Set up DynamoDB
- Configure Cognito authentication
- Create AppSync GraphQL API
- Connect your Next.js app

## Project Structure

```
viewgrams/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions and API clients
├── graphql/          # GraphQL queries and mutations
├── terraform/        # Infrastructure as Code
│   ├── *.tf          # Terraform configuration files
│   └── resolvers/    # AppSync resolver templates
└── hooks/            # Custom React hooks
```

## License

MIT
