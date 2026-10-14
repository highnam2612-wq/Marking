import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Target,
  Award,
  FileText,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Zap,
  Edit3,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  StudentSubmission,
  CourseWork,
  IELTSTaskType,
  IELTSTargetTier,
} from '../types/index.ts';

interface SubmissionsDashboardProps {
  currentCourseWork: CourseWork | null;
  submissions: StudentSubmission[];
  taskType: IELTSTaskType;
  targetTier: IELTSTargetTier;
  isBatchGrading: boolean;
  batchProgress: { current: number; total: number; currentStudentName?: string };
  autoReturnEnabled: boolean;
  onToggleAutoReturn: (enabled: boolean) => void;
  onUpdateCourseWorkInstruction: (newInstruction: string) => void;
  onStartBatchGrading: () => void;
  onGradeSingle: (submission: StudentSubmission) => void;
  onExamineSubmission: (submission: StudentSubmission) => void;
  onRequestSyncDraftAll: () => void;
  onRequestReturnAll: () => void;
  onRequestReturnSingle: (submission: StudentSubmission) => void;
}

export const SubmissionsDashboard: React.FC<SubmissionsDashboardProps> = ({
  currentCourseWork,
  submissions,
  taskType,
  targetTier,
  isBatchGrading,
  batchProgress,
  autoReturnEnabled,
  onToggleAutoReturn,
  onUpdateCourseWorkInstruction,
  onStartBatchGrading,
  onGradeSingle,
  onExamineSubmission,
  onRequestSyncDraftAll,
  onRequestReturnAll,
  onRequestReturnSingle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'graded' | 'returned' | 'pending' | 'turned_in'>('all');
  const [isEditingInstruction, setIsEditingInstruction] = useState(false);
  const [instructionText, setInstructionText] = useState(currentCourseWork?.description || '');

  const totalCount = submissions.length;
  const gradedList = submissions.filter((s) => s.ieltsEvaluation || s.draftGrade !== undefined);
  const gradedCount = gradedList.length;
  const turnedInCount = submissions.filter((s) => s.state === 'TURNED_IN').length;
  const returnedCount = submissions.filter((s) => s.state === 'RETURNED' || s.gradingStatus === 'synced').length;

  const averageBand =
    gradedCount > 0
      ? (
          gradedList.reduce((acc, s) => {
            const score = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
            return acc + score;
          }, 0) / gradedCount
        ).toFixed(1)
      : '--';

  const band7PlusCount = gradedList.filter((s) => {
    const b = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 0;
    return b >= 7.0;
  }).length;

  const handleSaveInstruction = () => {
    onUpdateCourseWorkInstruction(instructionText);
    setIsEditingInstruction(false);
  };

  // Format Due Date
  const formatDueDate = () => {
    if (!currentCourseWork?.dueDate) return 'Không giới hạn hạn nộp';
    const { year, month, day } = currentCourseWork.dueDate;
    const time = currentCourseWork.dueTime
      ? `${String(currentCourseWork.dueTime.hours || 23).padStart(2, '0')}:${String(
          currentCourseWork.dueTime.minutes || 59
        ).padStart(2, '0')}`
      : '23:59';
    return `${time} ngày ${day}/${month}/${year}`;
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      (sub.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'returned') {
      return sub.state === 'RETURNED' || sub.gradingStatus === 'synced';
    }
    if (statusFilter === 'graded') {
      return sub.ieltsEvaluation || sub.draftGrade !== undefined;
    }
    if (statusFilter === 'pending') {
      return !sub.ieltsEvaluation && sub.draftGrade === undefined;
    }
    if (statusFilter === 'turned_in') {
      return sub.state === 'TURNED_IN';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner: Assignment Info, Date nộp, Instruction buổi học */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                {taskType.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Target: Band {targetTier}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-semibold">Hạn nộp:</span>
                <span>{formatDueDate()}</span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 tracking-tight pt-1">
              {currentCourseWork?.title || 'Bài tập IELTS buổi học'}
            </h1>
          </div>

          {/* Batch Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Auto-Grade All */}
            <button
              onClick={onStartBatchGrading}
              disabled={isBatchGrading || submissions.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-md shadow-red-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isBatchGrading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang chấm ({batchProgress.current}/{batchProgress.total})...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Chấm hàng loạt ({submissions.length})</span>
                </>
              )}
            </button>

            {/* Batch Return to Classroom */}
            <button
              onClick={onRequestReturnAll}
              disabled={gradedCount === 0 || isBatchGrading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-md shadow-emerald-600/15 cursor-pointer"
              title="Tự động trả bài chính thức kèm Band điểm và nhận xét vào Google Classroom"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Trả bài tự động vào Classroom</span>
            </button>

            {/* Save Draft Only */}
            <button
              onClick={onRequestSyncDraftAll}
              disabled={gradedCount === 0 || isBatchGrading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300/80 disabled:opacity-40 transition-colors cursor-pointer"
              title="Chỉ lưu điểm nháp (học sinh chưa thấy)"
            >
              <Send className="w-3.5 h-3.5 text-gray-500" />
              <span>Lưu điểm nháp</span>
            </button>
          </div>
        </div>

        {/* Nội dung Instruction / Yêu cầu đề bài */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
            <span className="flex items-center gap-1.5 text-gray-600">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              Nội dung Instruction &amp; Đề bài buổi học:
            </span>
            <button
              onClick={() => {
                if (isEditingInstruction) handleSaveInstruction();
                else setIsEditingInstruction(true);
              }}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-[11px]"
            >
              {isEditingInstruction ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu yêu cầu</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa / Bổ sung yêu cầu</span>
                </>
              )}
            </button>
          </div>

          {isEditingInstruction ? (
            <textarea
              rows={3}
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              className="w-full text-xs text-gray-800 border border-red-300 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 bg-red-50/20"
              placeholder="Nhập chi tiết yêu cầu bài tập buổi học (ví dụ: Viết ít nhất 250 từ, sử dụng collocations chủ đề AI, thời gian làm 40 phút)..."
            />
          ) : (
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200/70">
              {currentCourseWork?.description || 'Chưa có hướng dẫn chi tiết cho bài tập này từ Google Classroom.'}
            </p>
          )}
        </div>

        {/* Auto-Return Checkbox Setting */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={autoReturnEnabled}
              onChange={(e) => onToggleAutoReturn(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-gray-800 font-semibold">
              Chế độ Auto-Pilot: Tự động trả bài ngay sau khi AI chấm xong từng bài
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              (Học sinh sẽ nhận thông báo trả bài trên Classroom tự động)
            </span>
          </label>

          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
            <span>Đã nộp: <strong className="text-gray-900">{turnedInCount}</strong></span>
            <span>•</span>
            <span>Đã chấm: <strong className="text-red-700">{gradedCount}</strong></span>
            <span>•</span>
            <span>Đã trả bài: <strong className="text-emerald-700">{returnedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Progress Bar when batch grading */}
      {isBatchGrading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-red-900 mb-2">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600 animate-spin" />
              Đang chấm bài của {batchProgress.currentStudentName || 'học sinh'} theo Band Descriptors {autoReturnEnabled ? '& tự động trả bài vào Classroom...' : '...'}
            </span>
            <span>
              {batchProgress.current} / {batchProgress.total} hoàn thành (
              {Math.round((batchProgress.current / batchProgress.total) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-red-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-700 rounded-full transition-all duration-300"
              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sĩ số lớp</span>
            <span className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-900">{totalCount}</span>
            <span className="text-xs text-gray-500 ml-1.5">học viên</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Band Trung Bình</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-indigo-700">Band {averageBand}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đạt Target (≥7.0)</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700">{band7PlusCount}</span>
            <span className="text-xs text-gray-500 ml-1.5">
              {gradedCount > 0 ? `(${Math.round((band7PlusCount / gradedCount) * 100)}%)` : ''}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đã Trả Bài</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-800">{returnedCount}</span>
            <span className="text-xs text-gray-500 ml-1.5">/ {totalCount} bài</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên học sinh, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả ({submissions.length})
          </button>
          <button
            onClick={() => setStatusFilter('graded')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'graded'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã chấm ({gradedCount})
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'returned'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã trả bài ({returnedCount})
          </button>
          <button
            onClick={() => setStatusFilter('turned_in')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'turned_in'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã nộp ({turnedInCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chưa chấm ({totalCount - gradedCount})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700">Không có bài nộp nào phù hợp</h3>
            <p className="text-xs text-gray-400">
              Không có học viên nào khớp với bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSubmissions.map((sub) => {
              const evalRes = sub.ieltsEvaluation;
              const finalBand = sub.teacherOverrideBand ?? evalRes?.overallBand ?? sub.draftGrade;
              const isGraded = finalBand !== undefined;
              const isReturned = sub.state === 'RETURNED' || sub.gradingStatus === 'synced';

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:px-6 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Candidate Identity */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      {(sub.studentName || 'H')[0].toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {sub.studentName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isReturned
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : sub.state === 'TURNED_IN'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {isReturned ? 'Đã trả bài (Returned)' : sub.state === 'TURNED_IN' ? 'Đã nộp bài' : sub.state}
                        </span>
                        {sub.late && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Nộp trễ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="truncate">{sub.studentEmail || 'Học viên Classroom'}</span>
                        {evalRes && (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đã chấm
                          </span>
                        )}
                        {evalRes?.academicIntegrityCheck?.flagged && (
                          <span className="flex items-center gap-1 text-amber-700 font-semibold">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            Nghi vấn mẫu học thuộc
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* IELTS Band Badge & 4 Pillars Preview */}
                  <div className="flex items-center gap-4 shrink-0">
                    {isGraded ? (
                      <div className="flex items-center gap-3 bg-red-50/70 border border-red-200 px-3.5 py-1.5 rounded-xl">
                        <div className="text-center">
                          <span className="text-lg font-black text-red-700 leading-tight">
                            Band {finalBand.toFixed(1)}
                          </span>
                        </div>
                        {evalRes?.subScores && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-gray-600 border-l border-red-200 pl-2">
                            {evalRes.subScores.map((s, idx) => (
                              <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700 font-bold">
                                {s.criterionCode}:{s.band.toFixed(1)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 italic">
                        Chưa chấm bài
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onExamineSubmission(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Xem chi tiết</span>
                      </button>

                      {!isGraded ? (
                        <button
                          onClick={() => onGradeSingle(sub)}
                          disabled={sub.gradingStatus === 'grading'}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {sub.gradingStatus === 'grading' ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>Chấm ngay</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onRequestReturnSingle(sub)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border shadow-2xs ${
                            isReturned
                              ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          }`}
                          title="Trả bài chính thức vào Google Classroom"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{isReturned ? 'Trả lại bài' : 'Trả bài ngay'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
