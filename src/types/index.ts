export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
  documentId: null | string;
}

export interface SyllabusEntry {
  id: string;
  teacherId: string;
  subject: string;
  topic: string;
  completionStatus: number;
  lastUpdated: string;
}

export interface ClassPeriod {
  id: string;
  teacherId: string;
  subject: string;
  date: string;
  period: number;
  attendanceCount: number;
  topicsCovered: string[];
}

export interface Document {
  id: string;
  teacherId: string;
  title: string;
  type: 'notes' | 'assignment' | 'material';
  uploadDate: string;
  description: string;
  url: string;
}

export interface publications {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  type: string;
  publishDate: string;
  url: string;
}