
import { Project, ProjectStatus, ProjectFile, Transaction, Milestone } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    projectNo: 'PJ-1024',
    title: 'Q3 Marketing Campaign',
    description: 'Social media ads and email blasts',
    creator: 'Sarah Jenkins',
    filesCount: 3,
    status: ProjectStatus.IN_PROGRESS,
    createdAt: 'Oct 24, 2023'
  },
  {
    id: '2',
    projectNo: 'PJ-1023',
    title: 'Website Redesign',
    description: 'Homepage overhaul',
    creator: 'David Miller',
    filesCount: 12,
    status: ProjectStatus.COMPLETED,
    createdAt: 'Oct 22, 2023'
  },
  {
    id: '3',
    projectNo: 'PJ-1022',
    title: 'Annual Financial Report',
    description: 'Drafting and audit preparation',
    creator: 'Elena Rodriguez',
    filesCount: 5,
    status: ProjectStatus.COMPLETED,
    createdAt: 'Oct 20, 2023'
  },
  {
    id: '4',
    projectNo: 'PJ-1021',
    title: 'Client Onboarding Portal',
    description: 'Requirements gathering',
    creator: 'James Wilson',
    filesCount: 0,
    status: ProjectStatus.IN_PROGRESS,
    createdAt: 'Oct 18, 2023'
  },
  {
    id: '5',
    projectNo: 'PJ-1020',
    title: 'Internal Security Audit',
    description: 'Quarterly access review',
    creator: 'Alex Morgan',
    filesCount: 2,
    status: ProjectStatus.IN_PROGRESS,
    createdAt: 'Oct 15, 2023'
  }
];

export const PROJECT_FILES: ProjectFile[] = [
  {
    id: 'f1',
    name: 'Architecture_Diagram.pdf',
    type: 'Technical Specification',
    uploadedBy: 'John Doe',
    modified: '2 days ago',
    size: '2.4 MB',
    icon: 'picture_as_pdf',
    color: 'text-red-600'
  },
  {
    id: 'f2',
    name: 'Application_Form_Final.docx',
    type: 'Project Application',
    uploadedBy: 'Sarah Anderson',
    modified: '5 days ago',
    size: '1.2 MB',
    icon: 'description',
    color: 'text-blue-600'
  },
  {
    id: 'f3',
    name: 'Status_Update_Q3_W2.xlsx',
    type: 'Progress Report',
    uploadedBy: 'Michael Kraft',
    modified: '1 week ago',
    size: '845 KB',
    icon: 'table_chart',
    color: 'text-green-600'
  }
];

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', date: 'Oct 24, 2023', description: 'Cloud Storage Expansion - Tier 1', category: 'Software', amount: 4250.00, status: 'Paid' },
  { id: 't2', date: 'Oct 22, 2023', description: 'External Technical Audit Fee', category: 'Labor', amount: 12800.00, status: 'Pending' },
  { id: 't3', date: 'Oct 18, 2023', description: 'Network Switch Upgrades (5 Units)', category: 'Hardware', amount: 8420.00, status: 'Paid' },
  { id: 't4', date: 'Oct 12, 2023', description: 'Security Awareness Training Material', category: 'Marketing', amount: 1150.00, status: 'Paid' },
];

export const MILESTONES: Milestone[] = [
  { id: 'm1', title: 'Project Kickoff', description: 'Initial stakeholder meeting and requirement gathering.', date: 'Jul 05, 2023', status: ProjectStatus.COMPLETED },
  { id: 'm2', title: 'Database Sync', description: 'Live synchronization of primary and secondary clusters.', date: 'Aug 15, 2023', status: ProjectStatus.IN_PROGRESS },
  { id: 'm3', title: 'Final Deployment', description: 'Switch-over to new production environment.', date: 'Sept 30, 2023', status: ProjectStatus.UPCOMING },
];
