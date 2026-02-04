export interface Project {
  projectId: string;
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  diagramCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateProjectInput {
  projectId: string;
  name?: string;
  description?: string | null;
  color?: string | null;
}

export interface ProjectConnection {
  items: Project[];
  nextToken?: string | null;
}

export interface ListProjectsResult {
  listProjects: ProjectConnection;
}

export interface GetProjectResult {
  getProject: Project;
}
