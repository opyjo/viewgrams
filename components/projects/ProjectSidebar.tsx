'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { LIST_PROJECTS } from '@/graphql/projectQueries';
import { ListProjectsResult, Project } from '@/types/project';
import ProjectManagementModal from './ProjectManagementModal';
import { FolderOpen, Plus, Settings, Loader2 } from 'lucide-react';

interface ProjectSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  diagramCounts?: Record<string, number>;
}

export default function ProjectSidebar({
  selectedProjectId,
  onSelectProject,
  diagramCounts = {},
}: ProjectSidebarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data, loading, refetch } = useQuery<ListProjectsResult>(LIST_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  });

  const projects = data?.listProjects?.items || [];

  const handleProjectClick = (projectId: string | null) => {
    onSelectProject(projectId);
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const uncategorizedCount = diagramCounts['uncategorized'] || 0;

  return (
    <>
      <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Projects
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* All Diagrams */}
          <button
            onClick={() => handleProjectClick(null)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-1 ${
              selectedProjectId === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium">All Diagrams</span>
            </div>
          </button>

          {/* Uncategorized */}
          <button
            onClick={() => handleProjectClick('uncategorized')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-4 ${
              selectedProjectId === 'uncategorized'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium">Uncategorized</span>
            </div>
            {uncategorizedCount > 0 && (
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {uncategorizedCount}
              </span>
            )}
          </button>

          {/* Projects List */}
          {loading && projects.length === 0 && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}

          {projects.map((project) => {
            const count = diagramCounts[project.projectId] || project.diagramCount || 0;
            const isSelected = selectedProjectId === project.projectId;
            return (
              <button
                key={project.projectId}
                onClick={() => handleProjectClick(project.projectId)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-1 group ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-white"
                    style={{
                      backgroundColor: project.color || '#3b82f6',
                      ringColor: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent'
                    }}
                  />
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleEditProject(e, project)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEditProject(e, project);
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer ${
                      isSelected ? 'hover:bg-white/10' : 'hover:bg-slate-200'
                    }`}
                    aria-label="Edit project"
                  >
                    <Settings size={14} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ProjectManagementModal
        open={modalOpen}
        onClose={handleModalClose}
        project={editingProject}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
