export type IELTSTaskType =
  | 'writing_task1'
  | 'writing_task2'
  | 'speaking_part1'
  | 'speaking_part2'
  | 'speaking_part3';

export type IELTSTargetTier = '5.0-5.5' | '6.0-6.5' | '7.0-7.5' | '8.0+';

export interface IELTSCorrection {
  originalText: string;
  correctedText: string;
  type: 'grammar' | 'vocabulary' | 'cohesion' | 'task_response' | 'pronunciation';
  explanation: string;
  bandImpact: string;
}

export interface IELTSSubScore {
  criterionCode: 'TR' | 'TA' | 'CC' | 'LR' | 'GRA' | 'FC' | 'PR';
  criterionName: string;
  band: number;
  descriptorEvidence: string;
  strengths: string[];
  growthAreas: string[];
}

export interface IELTSEvaluationResult {
  overallBand: number; // e.g. 6.5, 7.0, 7.5
  taskType: IELTSTaskType;
  subScores: IELTSSubScore[];
  summary: string;
  examinerComments: string;
  levelSensitiveAdvice: {
    currentLevelSummary: string;
    targetTier: IELTSTargetTier;
    nextBandTarget: number;
    actionableStepsToNextBand: string[];
  };
  detailedCorrections: IELTSCorrection[];
  vocabularyUpgrades: {
    originalWordOrPhrase: string;
    band7PlusAlternative: string;
    contextUsage: string;
  }[];
  wordCount?: number;
  academicIntegrityCheck: {
    flagged: boolean;
    reason: string;
    severity: 'none' | 'low' | 'medium' | 'high';
  };
}

export interface IELTSBenchmarkPaper {
  id: string;
  title: string;
  taskType: IELTSTaskType;
  prompt: string;
  studentContent: string;
  bandScores: {
    c1: number; // TR/TA or FC
    c2: number; // CC or LR
    c3: number; // LR or GRA
    c4: number; // GRA or PR
    overall: number;
  };
  examinerFeedback: string;
  source?: string; // 'NotebookLM Export', 'Past Marked Class', 'Examiner Pack'
  dateAdded?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface ClassroomAttachment {
  driveFile?: {
    id: string;
    title: string;
    alternateLink?: string;
    thumbnailUrl?: string;
  };
  link?: {
    url: string;
    title?: string;
  };
}

export interface StudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  studentName?: string;
  studentEmail?: string;
  studentPhoto?: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late?: boolean;
  draftGrade?: number; // Classroom grade out of 10 or 100
  assignedGrade?: number;
  assignmentSubmission?: {
    attachments?: ClassroomAttachment[];
  };
  shortAnswerSubmission?: {
    answer?: string;
  };
  fullContent?: string;
  ieltsEvaluation?: IELTSEvaluationResult;
  teacherOverrideBand?: number;
  teacherOverrideFeedback?: string;
  gradingStatus: 'idle' | 'grading' | 'graded' | 'synced' | 'error';
  errorMessage?: string;
  lastGradedAt?: string;
}

export interface CourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  maxPoints?: number;
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  alternateLink?: string;
  ieltsTaskType?: IELTSTaskType;
  targetTier?: IELTSTargetTier;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink?: string;
  defaultTier?: IELTSTargetTier;
}

export interface IELTSGradingConfig {
  taskType: IELTSTaskType;
  targetTier: IELTSTargetTier;
  benchmarkVault: IELTSBenchmarkPaper[];
  examinerStrictness: 'idp_standard' | 'strict_mock' | 'encouraging_coaching';
  customTeacherDirectives: string;
  notebookLmContextSummary?: string;
  highlightGrammarErrors: boolean;
  provideVocabularyUpgrades: boolean;
}
