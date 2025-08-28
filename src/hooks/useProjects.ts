import { useState, useEffect } from "react";
import type { Project } from "../types";
import { db } from "../services/database";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const allProjects = await db.projects
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      setProjects(allProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.projects.add(newProject);
    await loadProjects();
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    await loadProjects();
  };

  const deleteProject = async (id: string) => {
    await db.projects.delete(id);
    await loadProjects();
  };

  const getProject = async (id: string): Promise<Project | undefined> => {
    return await db.projects.get(id);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    setProjects,
    refreshProjects: loadProjects,
  };
};
