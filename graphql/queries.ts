import { gql } from '@apollo/client';

export const GET_DIAGRAM = gql`
  query GetDiagram($id: ID!) {
    getDiagram(id: $id) {
      id
      title
      description
      code
      svgPreview
      createdAt
      updatedAt
      tags
      projectId
    }
  }
`;

export const LIST_DIAGRAMS = gql`
  query ListDiagrams($limit: Int, $nextToken: String, $projectId: String) {
    listDiagrams(limit: $limit, nextToken: $nextToken, projectId: $projectId) {
      items {
        id
        title
        description
        svgPreview
        createdAt
        updatedAt
        tags
        projectId
      }
      nextToken
    }
  }
`;

// WARNING: searchDiagrams uses a DynamoDB Scan with contains() filter.
// This is O(n) and will degrade as the table grows. For production scale,
// consider migrating to OpenSearch/Elasticsearch or DynamoDB GSI on title.
export const SEARCH_DIAGRAMS = gql`
  query SearchDiagrams($searchTerm: String!, $projectId: String) {
    searchDiagrams(searchTerm: $searchTerm, projectId: $projectId) {
      id
      title
      description
      svgPreview
      createdAt
      updatedAt
      tags
      projectId
    }
  }
`;
