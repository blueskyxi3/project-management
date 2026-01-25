
export enum ProjectStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  UPCOMING = 'Upcoming',
  PENDING = 'Pending'
}

export interface Project {
  id: string;
  projectNo: string;
  title: string;
  description: string;
  creator: string;
  filesCount: number;
  status: ProjectStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: ProjectStatus;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  modified: string;
  size: string;
  icon: string;
  color: string;
}

export type TabType = 'Overview' | 'Strategy' | 'Technical' | 'Timeline' | 'Budget';
