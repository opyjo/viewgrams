'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useMutation } from '@apollo/client/react';
import { CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT } from '@/graphql/projectMutations';
import { LIST_PROJECTS } from '@/graphql/projectQueries';
import { Project, CreateProjectInput, UpdateProjectInput } from '@/types/project';
import { Trash2, Loader2 } from 'lucide-react';

interface ProjectManagementModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export default function ProjectManagementModal({
  open,
  onClose,
  project,
  onSuccess,
}: ProjectManagementModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!project;

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setDescription(project.description || '');
        setColor(project.color || PRESET_COLORS[0]);
      } else {
        setName('');
        setDescription('');
        setColor(PRESET_COLORS[0]);
      }
      setShowDeleteConfirm(false);
    }
  }, [open, project]);

  const [createProject, { loading: createLoading }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: LIST_PROJECTS }],
    onCompleted: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error.message}\n\nPlease ensure Terraform infrastructure is deployed.`);
    },
  });

  const [updateProject, { loading: updateLoading }] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: LIST_PROJECTS }],
    onCompleted: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    },
  });

  const [deleteProject, { loading: deleteLoading }] = useMutation(DELETE_PROJECT, {
    refetchQueries: [{ query: LIST_PROJECTS }],
    onCompleted: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      if (error.message.includes('diagramCount')) {
        alert('Cannot delete project with diagrams. Please move all diagrams to uncategorized first.');
      } else {
        alert('Failed to delete project. Please try again.');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Project name is required');
      return;
    }

    if (isEditing && project) {
      const input: UpdateProjectInput = {
        projectId: project.projectId,
        name: name.trim(),
        description: description.trim() || null,
        color,
      };
      await updateProject({ variables: { input } });
    } else {
      const input: CreateProjectInput = {
        name: name.trim(),
        description: description.trim() || null,
        color,
      };
      await createProject({ variables: { input } });
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    await deleteProject({ variables: { projectId: project.projectId } });
  };

  const loading = createLoading || updateLoading || deleteLoading;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Project' : 'Create Project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-slate-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="Enter project name"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            placeholder="Enter description (optional)"
            rows={3}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === presetColor
                    ? 'ring-2 ring-slate-900 ring-offset-2 ring-offset-white scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: presetColor }}
                disabled={loading}
                aria-label={`Select color ${presetColor}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isEditing && project && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-red-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {deleteLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(createLoading || updateLoading) && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
