export interface Diagram {
    id: string;
    title: string;
    description?: string | null;
    svgPreview?: string | null;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[] | null;
    code: string;
    projectId?: string | null;
}

export interface DiagramSummary {
    id: string;
    title: string;
    description?: string | null;
    svgPreview?: string | null;
    createdAt?: string;
    updatedAt?: string;
    projectId?: string | null;
}

export interface CreateDiagramInput {
    title: string;
    description?: string | null;
    code: string;
    svgPreview?: string | null;
    tags?: string[] | null;
    projectId?: string | null;
}

export interface UpdateDiagramInput {
    id: string;
    title?: string;
    description?: string | null;
    code?: string;
    svgPreview?: string | null;
    projectId?: string | null;
}

export interface CreateDiagramResult {
    createDiagram: { id: string } | null;
}

export interface GetDiagramResult {
    getDiagram: Diagram | null;
}

export interface ListDiagramsResult {
    listDiagrams: {
        items: DiagramSummary[];
        nextToken?: string | null;
    };
}

export interface SearchDiagramsResult {
    searchDiagrams: DiagramSummary[];
}
