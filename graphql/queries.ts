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
    }
  }
`;

export const LIST_DIAGRAMS = gql`
  query ListDiagrams($limit: Int, $nextToken: String) {
    listDiagrams(limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        svgPreview
        createdAt
        updatedAt
        tags
      }
      nextToken
    }
  }
`;

export const SEARCH_DIAGRAMS = gql`
  query SearchDiagrams($searchTerm: String!) {
    searchDiagrams(searchTerm: $searchTerm) {
      id
      title
      description
      svgPreview
      createdAt
      updatedAt
      tags
    }
  }
`;
