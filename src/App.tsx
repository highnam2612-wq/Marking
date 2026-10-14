import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth.ts';
import { ClassroomService } from './services/classroom.ts';
import {
  ClassroomCourse,
  CourseWork,
  StudentSubmission,
  IELTSGradingConfig,
  IELTSTaskType,
  IELTSTargetTier,
  IELTSEvaluationResult,
} from './types/index.ts';
import {
  INITIAL_BENCHMARK_VAULT,
  MOCK_COURSES,
  MOCK_COURSEWORK,
  MOCK_SUBMISSIONS,
} from './data/mockClassroom.ts';
import { Header } from './components/Header.tsx';
import { SubmissionsDashboard } from './components/SubmissionsDashboard.tsx';
import { RubricTrainer } from './components/RubricTrainer.tsx';
import { ClassAnalytics } from './components/ClassAnalytics.tsx';
import { SubmissionExaminerModal } from './components/SubmissionExaminerModal.tsx';
import { ConfirmationModal } from './components/ConfirmationModal.tsx';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  // Classroom state
  const [courses, setCourses] = useState<ClassroomCourse[]>(MOCK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(MOCK_COURSES[0]);
  const [courseWorkList, setCourseWorkList] = useState<CourseWork[]>([]);
  const [selectedCourseWork, setSelectedCourseWork] = useState<CourseWork | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'submissions' | 'vault' | 'analytics'>('submissions');
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auto-Pilot return state
  const [autoReturnEnabled, setAutoReturnEnabled] = useState<boolean>(false);

  // IELTS Specific Configuration
  const [currentTaskType, setCurrentTaskType] = useState<IELTSTaskType>('writing_task2');
  const [currentTargetTier, setCurrentTargetTier] = useState<IELTSTargetTier>('7.0-7.5');
  const [gradingConfig, setGradingConfig] = useState<IELTSGradingConfig>({
    taskType: 'writing_task2',
    targetTier: '7.0-7.5',
    benchmarkVault: INITIAL_BENCHMARK_VAULT,
    examinerStrictness: 'idp_standard',
    customTeacherDirectives: 'Strict on Task Response development and over-generalized statements. Provide high-level Band 8.0 collocations for repetitive words.',
    highlightGrammarErrors: true,
    provideVocabularyUpgrades: true,
  });

  // Batch grading state
  const [isBatchGrading, setIsBatchGrading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentStudentName?: string }>({
    current: 0,
    total: 0,
  });

  // Examiner modal state
  const [selectedSubmissionForExaminer, setSelectedSubmissionForExaminer] = useState<StudentSubmission | null>(null);
  const [isExaminerOpen, setIsExaminerOpen] = useState<boolean>(false);
  const [isGradingSingleInExaminer, setIsGradingSingleInExaminer] = useState<boolean>(false);

  // Confirmation modal state for Google Classroom grade updates / returns
  const [confirmationData, setConfirmationData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    items: { label: string; detail?: string }[];
    confirmButtonText?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    items: [],
    onConfirm: async () => {},
  });
  const [isSyncingWithClassroom, setIsSyncingWithClassroom] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessTokenState(token);
        setIsSimulatedMode(false);
        loadClassroomData(token);
      },
      () => {
        setUser(null);
        setAccessTokenState(null);
        setIsSimulatedMode(true);
        loadSimulatedData();
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Load Classroom Data
  const loadClassroomData = async (token: string) => {
    setIsLoadingData(true);
    try {
      const fetchedCourses = await ClassroomService.getCourses(token);
      setCourses(fetchedCourses);
      const initialCourse = fetchedCourses[0] || null;
      setSelectedCourse(initialCourse);

      if (initialCourse) {
        const cwList = await ClassroomService.getCourseWork(initialCourse.id, token);
        setCourseWorkList(cwList);
        const initialCw = cwList[0] || null;
        setSelectedCourseWork(initialCw);

        if (initialCw) {
          const fetchedSubs = await ClassroomService.getStudentSubmissions(initialCourse.id, initialCw.id, token);
          setSubmissions(fetchedSubs);
        } else {
          setSubmissions([]);
        }
      }
    } catch (err) {
      console.error('Failed to load Google Classroom data:', err);
      showToast('Could not load live Classroom data. Loaded sample IELTS class.', 'error');
      loadSimulatedData();
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadSimulatedData = () => {
    setCourses(MOCK_COURSES);
    const mockCourse = MOCK_COURSES[0];
    setSelectedCourse(mockCourse);
    const cwList = MOCK_COURSEWORK[mockCourse.id] || [];
    setCourseWorkList(cwList);
    const initialCw = cwList[0] || null;
    setSelectedCourseWork(initialCw);
    if (initialCw) {
      setSubmissions(MOCK_SUBMISSIONS[initialCw.id] || []);
    } else {
      setSubmissions([]);
    }
  };

  // Course / CourseWork Selection handlers
  const handleSelectCourse = async (course: ClassroomCourse) => {
    setSelectedCourse(course);
    if (course.defaultTier) {
      setCurrentTargetTier(course.defaultTier);
      setGradingConfig((prev) => ({ ...prev, targetTier: course.defaultTier || '7.0-7.5' }));
    }
    setIsLoadingData(true);
    try {
      const cwList = await ClassroomService.getCourseWork(course.id, accessToken);
      setCourseWorkList(cwList);
      const firstCw = cwList[0] || null;
      setSelectedCourseWork(firstCw);

      if (firstCw) {
        if (firstCw.ieltsTaskType) {
          setCurrentTaskType(firstCw.ieltsTaskType);
          setGradingConfig((prev) => ({ ...prev, taskType: firstCw.ieltsTaskType || 'writing_task2' }));
        }
        const subs = await ClassroomService.getStudentSubmissions(course.id, firstCw.id, accessToken);
        setSubmissions(subs);
      } else {
        setSubmissions([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSelectCourseWork = async (cw: CourseWork) => {
    setSelectedCourseWork(cw);
    if (cw.ieltsTaskType) {
      setCurrentTaskType(cw.ieltsTaskType);
      setGradingConfig((prev) => ({ ...prev, taskType: cw.ieltsTaskType || 'writing_task2' }));
    }
    if (cw.targetTier) {
      setCurrentTargetTier(cw.targetTier);
      setGradingConfig((prev) => ({ ...prev, targetTier: cw.targetTier || '7.0-7.5' }));
    }
    if (!selectedCourse) return;
    setIsLoadingData(true);
    try {
      const subs = await ClassroomService.getStudentSubmissions(selectedCourse.id, cw.id, accessToken);
      setSubmissions(subs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Update instructions for assignment
  const handleUpdateCourseWorkInstruction = (newInstruction: string) => {
    if (selectedCourseWork) {
      setSelectedCourseWork({
        ...selectedCourseWork,
        description: newInstruction,
      });
      showToast('Đã cập nhật nội dung instruction & đề bài buổi học');
    }
  };

  // Switch Task Type & Target Tier
  const handleChangeTaskType = (type: IELTSTaskType) => {
    setCurrentTaskType(type);
    setGradingConfig((prev) => ({ ...prev, taskType: type }));
  };

  const handleChangeTargetTier = (tier: IELTSTargetTier) => {
    setCurrentTargetTier(tier);
    setGradingConfig((prev) => ({ ...prev, targetTier: tier }));
    showToast(`Level-sensitivity updated: Band ${tier}`);
  };

  // Toggle Demo Mode
  const handleToggleSimulatedMode = () => {
    if (isSimulatedMode) {
      if (accessToken) {
        setIsSimulatedMode(false);
        loadClassroomData(accessToken);
        showToast('Switched to live Google Classroom');
      } else {
        handleSignIn();
      }
    } else {
      setIsSimulatedMode(true);
      loadSimulatedData();
      showToast('Switched to Sample IELTS Cohort');
    }
  };

  // Auth Handlers
  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessTokenState(res.accessToken);
        setIsSimulatedMode(false);
        loadClassroomData(res.accessToken);
        showToast(`Connected Classroom as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      showToast('Google Sign-in failed: ' + (err.message || 'Cancelled'), 'error');
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessTokenState(null);
    setIsSimulatedMode(true);
    loadSimulatedData();
    showToast('Signed out from Google Classroom');
  };

  // 3. Core IELTS Grading Call
  const evaluateSingleSubmissionInternal = async (
    submission: StudentSubmission
  ): Promise<IELTSEvaluationResult> => {
    const payload = {
      studentName: submission.studentName || 'Candidate',
      submissionText: submission.fullContent || 'Empty submission',
      taskType: currentTaskType,
      promptQuestion: selectedCourseWork?.description || selectedCourseWork?.title || 'IELTS Question',
      targetTier: currentTargetTier,
      examinerStrictness: gradingConfig.examinerStrictness,
      customDirectives: gradingConfig.customTeacherDirectives,
      benchmarkVault: gradingConfig.benchmarkVault,
    };

    const res = await fetch('/api/grade-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP error ${res.status}`);
    }

    const result = (await res.json()) as IELTSEvaluationResult;
    return result;
  };

  // Single grade
  const handleGradeSingle = async (submission: StudentSubmission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, gradingStatus: 'grading' } : s))
    );

    try {
      const ieltsEvaluation = await evaluateSingleSubmissionInternal(submission);
      const updatedSub: StudentSubmission = {
        ...submission,
        ieltsEvaluation,
        gradingStatus: 'graded',
        lastGradedAt: new Date().toISOString(),
      };

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? updatedSub : s))
      );
      showToast(`Đã chấm ${submission.studentName}: Overall Band ${ieltsEvaluation.overallBand.toFixed(1)}`);

      // If auto-return is on, prompt or auto-return
      if (autoReturnEnabled && selectedCourse && selectedCourseWork) {
        await ClassroomService.updateAndReturnSubmission(
          selectedCourse.id,
          selectedCourseWork.id,
          submission.id,
          ieltsEvaluation.overallBand,
          accessToken
        );
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submission.id
              ? { ...s, state: 'RETURNED', gradingStatus: 'synced', assignedGrade: ieltsEvaluation.overallBand }
              : s
          )
        );
        showToast(`Đã tự động trả bài cho ${submission.studentName} vào Classroom!`);
      }
    } catch (err: any) {
      console.error(err);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? { ...s, gradingStatus: 'error', errorMessage: err.message } : s))
      );
      showToast(`Chấm bài thất bại: ${err.message}`, 'error');
    }
  };

  // Regrade inside Examiner modal
  const handleRegradeInExaminer = async (submission: StudentSubmission) => {
    setIsGradingSingleInExaminer(true);
    try {
      const ieltsEvaluation = await evaluateSingleSubmissionInternal(submission);
      const updatedSubmission: StudentSubmission = {
        ...submission,
        ieltsEvaluation,
        teacherOverrideBand: undefined,
        teacherOverrideFeedback: undefined,
        gradingStatus: 'graded',
        lastGradedAt: new Date().toISOString(),
      };

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? updatedSubmission : s))
      );
      setSelectedSubmissionForExaminer(updatedSubmission);
      showToast(`Chấm lại thành công: Overall Band ${ieltsEvaluation.overallBand.toFixed(1)}`);
    } catch (err: any) {
      console.error(err);
      showToast(`Remarking failed: ${err.message}`, 'error');
    } finally {
      setIsGradingSingleInExaminer(false);
    }
  };

  // Batch grade all submissions
  const handleStartBatchGrading = async () => {
    if (submissions.length === 0) return;
    setIsBatchGrading(true);
    setBatchProgress({ current: 0, total: submissions.length });

    let completed = 0;
    const currentSubs = [...submissions];

    for (let i = 0; i < currentSubs.length; i++) {
      const sub = currentSubs[i];
      setBatchProgress({
        current: completed,
        total: currentSubs.length,
        currentStudentName: sub.studentName,
      });

      setSubmissions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, gradingStatus: 'grading' } : s))
      );

      try {
        const ieltsEvaluation = await evaluateSingleSubmissionInternal(sub);
        completed++;

        // Auto-return if enabled
        let finalState: StudentSubmission['state'] = sub.state;
        let finalStatus: StudentSubmission['gradingStatus'] = 'graded';

        if (autoReturnEnabled && selectedCourse && selectedCourseWork) {
          await ClassroomService.updateAndReturnSubmission(
            selectedCourse.id,
            selectedCourseWork.id,
            sub.id,
            ieltsEvaluation.overallBand,
            accessToken
          );
          finalState = 'RETURNED';
          finalStatus = 'synced';
        }

        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? {
                  ...s,
                  state: finalState,
                  ieltsEvaluation,
                  gradingStatus: finalStatus,
                  assignedGrade: autoReturnEnabled ? ieltsEvaluation.overallBand : s.assignedGrade,
                  draftGrade: ieltsEvaluation.overallBand,
                  lastGradedAt: new Date().toISOString(),
                }
              : s
          )
        );

        setBatchProgress({
          current: completed,
          total: currentSubs.length,
          currentStudentName: sub.studentName,
        });
      } catch (err: any) {
        console.error(`Failed to grade ${sub.studentName}:`, err);
        setSubmissions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, gradingStatus: 'error' } : s))
        );
      }
    }

    setIsBatchGrading(false);
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
    });
    showToast(
      autoReturnEnabled
        ? `Hoàn tất chấm & tự động trả bài cho ${completed} học viên vào Google Classroom!`
        : `Hoàn tất chấm ${completed} bài thi theo chuẩn IELTS!`
    );
  };

  // Save manual teacher override
  const handleSaveOverride = (
    submissionId: string,
    overrideBand: number,
    overrideFeedback?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              teacherOverrideBand: overrideBand,
              teacherOverrideFeedback: overrideFeedback,
            }
          : s
      )
    );

    if (selectedSubmissionForExaminer?.id === submissionId) {
      setSelectedSubmissionForExaminer((prev) =>
        prev
          ? {
              ...prev,
              teacherOverrideBand: overrideBand,
              teacherOverrideFeedback: overrideFeedback,
            }
          : null
      );
    }

    showToast('Đã lưu điểm điều chỉnh của giáo viên.');
  };

  // Open Examiner modal
  const handleExamineSubmission = (submission: StudentSubmission) => {
    setSelectedSubmissionForExaminer(submission);
    setIsExaminerOpen(true);
  };

  const handleNavigateNextExaminer = () => {
    if (!selectedSubmissionForExaminer) return;
    const idx = submissions.findIndex((s) => s.id === selectedSubmissionForExaminer.id);
    if (idx < submissions.length - 1) {
      setSelectedSubmissionForExaminer(submissions[idx + 1]);
    }
  };

  const handleNavigatePrevExaminer = () => {
    if (!selectedSubmissionForExaminer) return;
    const idx = submissions.findIndex((s) => s.id === selectedSubmissionForExaminer.id);
    if (idx > 0) {
      setSelectedSubmissionForExaminer(submissions[idx - 1]);
    }
  };

  // 4. Classroom Return / Draft Sync Handlers
  const handleRequestReturnSingle = (submission: StudentSubmission, customScore?: number) => {
    if (!selectedCourse || !selectedCourseWork) return;

    const finalBand =
      customScore ??
      submission.teacherOverrideBand ??
      submission.ieltsEvaluation?.overallBand ??
      submission.draftGrade ??
      6.0;

    setConfirmationData({
      isOpen: true,
      title: 'Trả bài vào Google Classroom cho học viên?',
      message: `Bạn chuẩn bị TRẢ BÀI CHÍNH THỨC cho học viên ${submission.studentName} với điểm Band ${finalBand.toFixed(1)} / 9.0 cho bài "${selectedCourseWork.title}". Học viên sẽ nhận được thông báo trả bài trên Classroom ngay lập tức.`,
      items: [{ label: submission.studentName || 'Học viên', detail: `Official Band ${finalBand.toFixed(1)} / 9.0` }],
      confirmButtonText: 'Xác nhận Trả bài ngay',
      onConfirm: async () => {
        setIsSyncingWithClassroom(true);
        try {
          const success = await ClassroomService.updateAndReturnSubmission(
            selectedCourse.id,
            selectedCourseWork.id,
            submission.id,
            finalBand,
            accessToken
          );
          if (success) {
            setSubmissions((prev) =>
              prev.map((s) =>
                s.id === submission.id
                  ? { ...s, state: 'RETURNED', assignedGrade: finalBand, draftGrade: finalBand, gradingStatus: 'synced' }
                  : s
              )
            );
            showToast(`Đã trả bài chính thức cho ${submission.studentName} trên Classroom!`);
          } else {
            showToast('Không thể trả bài trên Classroom', 'error');
          }
        } finally {
          setIsSyncingWithClassroom(false);
          setConfirmationData((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRequestReturnAll = () => {
    if (!selectedCourse || !selectedCourseWork) return;

    const gradedItems = submissions.filter(
      (s) => s.ieltsEvaluation || s.teacherOverrideBand !== undefined || s.draftGrade !== undefined
    );

    if (gradedItems.length === 0) {
      showToast('Chưa có bài nào được chấm để trả.', 'error');
      return;
    }

    const itemsSummary = gradedItems.map((s) => {
      const band = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
      return {
        label: s.studentName || 'Học viên',
        detail: `Band ${band.toFixed(1)} / 9.0`,
      };
    });

    setConfirmationData({
      isOpen: true,
      title: `Trả bài tự động cho toàn bộ ${gradedItems.length} học viên trên Classroom?`,
      message: `Hệ thống sẽ cập nhật điểm Band và chuyển trạng thái bài nộp thành "Đã trả bài" (Returned) cho ${gradedItems.length} học sinh trong bài tập "${selectedCourseWork.title}". Học sinh sẽ xem được điểm số và nhận thông báo của Google Classroom.`,
      items: itemsSummary,
      confirmButtonText: `Xác nhận Trả bài cho ${gradedItems.length} học viên`,
      onConfirm: async () => {
        setIsSyncingWithClassroom(true);
        try {
          let returnedCount = 0;
          for (const item of gradedItems) {
            const band = item.teacherOverrideBand ?? item.ieltsEvaluation?.overallBand ?? item.draftGrade ?? 6.0;
            const ok = await ClassroomService.updateAndReturnSubmission(
              selectedCourse.id,
              selectedCourseWork.id,
              item.id,
              band,
              accessToken
            );
            if (ok) returnedCount++;
          }

          setSubmissions((prev) =>
            prev.map((s) => {
              if (s.ieltsEvaluation || s.teacherOverrideBand !== undefined) {
                const band = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
                return { ...s, state: 'RETURNED', assignedGrade: band, draftGrade: band, gradingStatus: 'synced' };
              }
              return s;
            })
          );
          showToast(`Đã trả bài tự động thành công cho ${returnedCount} học viên vào Google Classroom!`);
        } finally {
          setIsSyncingWithClassroom(false);
          setConfirmationData((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRequestSyncDraftAll = () => {
    if (!selectedCourse || !selectedCourseWork) return;

    const gradedItems = submissions.filter(
      (s) => s.ieltsEvaluation || s.teacherOverrideBand !== undefined || s.draftGrade !== undefined
    );

    if (gradedItems.length === 0) {
      showToast('Chưa có bài nào được chấm để lưu điểm nháp.', 'error');
      return;
    }

    const itemsSummary = gradedItems.map((s) => {
      const band = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
      return {
        label: s.studentName || 'Học viên',
        detail: `Draft Band ${band.toFixed(1)} / 9.0`,
      };
    });

    setConfirmationData({
      isOpen: true,
      title: `Lưu điểm nháp (Draft) cho ${gradedItems.length} học viên?`,
      message: `Hệ thống sẽ lưu điểm nháp vào Classroom. Học viên sẽ CHƯA nhận được thông báo hay điểm cho đến khi bạn bấm Trả bài.`,
      items: itemsSummary,
      confirmButtonText: 'Lưu điểm nháp vào Classroom',
      onConfirm: async () => {
        setIsSyncingWithClassroom(true);
        try {
          let syncedCount = 0;
          for (const item of gradedItems) {
            const band = item.teacherOverrideBand ?? item.ieltsEvaluation?.overallBand ?? item.draftGrade ?? 6.0;
            const ok = await ClassroomService.updateDraftGrade(
              selectedCourse.id,
              selectedCourseWork.id,
              item.id,
              band,
              accessToken
            );
            if (ok) syncedCount++;
          }

          setSubmissions((prev) =>
            prev.map((s) => {
              if (s.ieltsEvaluation || s.teacherOverrideBand !== undefined) {
                const band = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
                return { ...s, draftGrade: band, gradingStatus: 'synced' };
              }
              return s;
            })
          );
          showToast(`Đã lưu điểm nháp cho ${syncedCount} học viên!`);
        } finally {
          setIsSyncingWithClassroom(false);
          setConfirmationData((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-gray-900 selection:bg-red-100 selection:text-red-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-white text-gray-900 border-gray-200 shadow-red-500/10'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        user={user}
        courses={courses}
        selectedCourse={selectedCourse}
        courseWorkList={courseWorkList}
        selectedCourseWork={selectedCourseWork}
        activeTab={activeTab}
        isSimulatedMode={isSimulatedMode}
        isLoadingData={isLoadingData}
        currentTaskType={currentTaskType}
        currentTargetTier={currentTargetTier}
        onChangeTaskType={handleChangeTaskType}
        onChangeTargetTier={handleChangeTargetTier}
        onSelectCourse={handleSelectCourse}
        onSelectCourseWork={handleSelectCourseWork}
        onChangeTab={setActiveTab}
        onToggleSimulatedMode={handleToggleSimulatedMode}
        onRefreshData={() => {
          if (accessToken) loadClassroomData(accessToken);
          else loadSimulatedData();
        }}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'submissions' && (
          <SubmissionsDashboard
            currentCourseWork={selectedCourseWork}
            submissions={submissions}
            taskType={currentTaskType}
            targetTier={currentTargetTier}
            isBatchGrading={isBatchGrading}
            batchProgress={batchProgress}
            autoReturnEnabled={autoReturnEnabled}
            onToggleAutoReturn={setAutoReturnEnabled}
            onUpdateCourseWorkInstruction={handleUpdateCourseWorkInstruction}
            onStartBatchGrading={handleStartBatchGrading}
            onGradeSingle={handleGradeSingle}
            onExamineSubmission={handleExamineSubmission}
            onRequestSyncDraftAll={handleRequestSyncDraftAll}
            onRequestReturnAll={handleRequestReturnAll}
            onRequestReturnSingle={(sub) => handleRequestReturnSingle(sub)}
          />
        )}

        {activeTab === 'vault' && (
          <RubricTrainer
            config={gradingConfig}
            onUpdateConfig={(updates) => setGradingConfig((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {activeTab === 'analytics' && (
          <ClassAnalytics
            currentCourseWork={selectedCourseWork}
            submissions={submissions}
            taskType={currentTaskType}
            targetTier={currentTargetTier}
          />
        )}
      </main>

      {/* Submission Examiner & Edit Modal */}
      <SubmissionExaminerModal
        isOpen={isExaminerOpen}
        submission={selectedSubmissionForExaminer}
        taskType={currentTaskType}
        isGrading={isGradingSingleInExaminer}
        onClose={() => setIsExaminerOpen(false)}
        onRegrade={handleRegradeInExaminer}
        onSaveOverride={handleSaveOverride}
        onRequestSyncToClassroom={(sub, customScore) => handleRequestReturnSingle(sub, customScore)}
        onNavigateNext={handleNavigateNextExaminer}
        onNavigatePrev={handleNavigatePrevExaminer}
      />

      {/* Google Classroom Operation Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationData.isOpen}
        title={confirmationData.title}
        message={confirmationData.message}
        items={confirmationData.items}
        confirmButtonText={confirmationData.confirmButtonText || 'Xác nhận & Cập nhật'}
        isLoading={isSyncingWithClassroom}
        onConfirm={confirmationData.onConfirm}
        onCancel={() => setConfirmationData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
