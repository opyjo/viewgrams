import { gql } from '@apollo/client';

export const GET_PROJECT = gql`
  query GetProject($projectId: ID!) {
    getProject(projectId: $projectId) {
      projectId
      userId
      name
      description
      color
      diagramCount
      createdAt
      updatedAt
    }
  }
`;

export const LIST_PROJECTS = gql`
  query ListProjects($limit: Int, $nextToken: String) {
    listProjects(limit: $limit, nextToken: $nextToken) {
      items {
        projectId
        userId
        name
        description
        color
        diagramCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
