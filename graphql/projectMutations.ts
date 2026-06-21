import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
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

export const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      projectId
    }
  }
`;

// LIMITATION: moveAllDiagramsToUncategorized only queries diagrams by projectId
// but does NOT update them (requires a pipeline resolver or Lambda to batch-update).
// Client-side workaround: loop through diagrams and call updateDiagram to clear projectId
// before calling deleteProject.
export const MOVE_ALL_DIAGRAMS_TO_UNCATEGORIZED = gql`
  mutation MoveAllDiagramsToUncategorized($projectId: ID!) {
    moveAllDiagramsToUncategorized(projectId: $projectId)
  }
`;
