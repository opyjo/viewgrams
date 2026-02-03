import { gql } from '@apollo/client';

export const CREATE_DIAGRAM = gql`
  mutation CreateDiagram($input: CreateDiagramInput!) {
    createDiagram(input: $input) {
      id
      title
      description
      code
      svgPreview
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DIAGRAM = gql`
  mutation UpdateDiagram($input: UpdateDiagramInput!) {
    updateDiagram(input: $input) {
      id
      title
      description
      code
      svgPreview
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DIAGRAM = gql`
  mutation DeleteDiagram($id: ID!) {
    deleteDiagram(id: $id) {
      id
    }
  }
`;
