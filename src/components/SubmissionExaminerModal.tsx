import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Send,
  Sliders,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Lightbulb,
  FileCheck,
  Languages,
} from 'lucide-react';
import { StudentSubmission, IELTSTaskType } from '../types/index.ts';

interface SubmissionExaminerModalProps {
  isOpen: boolean;
  submission: StudentSubmission | null;
  taskType: IELTSTaskType;
  isGrading: boolean;
  onClose: () => void;
  onRegrade: (submission: StudentSubmission) => void;
  onSaveOverride: (submissionId: string, overrideBand: number, overrideFeedback?: string) => void;
  onRequestSyncToClassroom: (submission: StudentSubmission, score: number) => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
}

export const SubmissionExaminerModal: React.FC<SubmissionExaminerModalProps> = ({
  isOpen,
  submission,
  taskType,
  isGrading,
  onClose,
  onRegrade,
  onSaveOverride,
  onRequestSyncToClassroom,
  onNavigateNext,
  onNavigatePrev,
}) => {
  if (!isOpen || !submission) return null;

  const evaluation = submission.ieltsEvaluation;
  const currentBand = submission.teacherOverrideBand ?? evaluation?.overallBand ?? submission.draftGrade ?? 6.0;

  const [overrideBand, setOverrideBand] = useState<number>(currentBand);
  const [overrideFeedback, setOverrideFeedback] = useState<string>(
    submission.teacherOverrideFeedback || evaluation?.examinerComments || ''
  );
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (submission) {
      const band = submission.teacherOverrideBand ?? submission.ieltsEvaluation?.overallBand ?? submission.draftGrade ?? 6.0;
      setOverrideBand(band);
      setOverrideFeedback(submission.teacherOverrideFeedback || submission.ieltsEvaluation?.examinerComments || '');
    }
  }, [submission.id, submission.ieltsEvaluation, submission.teacherOverrideBand]);

  const wordsCount = (submission.fullContent || '').trim().split(/\s+/).filter(Boolean).length;

  const handleCopySubmission = () => {
    navigator.clipboard.writeText(submission.fullContent || '');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleApplyOverride = () => {
    onSaveOverride(submission.id, Number(overrideBand), overrideFeedback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {(submission.studentName || 'S')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{submission.studentName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200">
                  {submission.state}
                </span>
                {submission.late && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Late Submission
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{submission.studentEmail || 'Classroom Student'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigatePrev && (
              <button
                onClick={onNavigatePrev}
                title="Previous Candidate"
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNavigateNext && (
              <button
                onClick={onNavigateNext}
                title="Next Candidate"
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => onRegrade(submission)}
              disabled={isGrading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGrading ? 'animate-spin' : ''}`} />
              <span>{isGrading ? 'Marking...' : 'Remark with ExaminerAI'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Column: Student Submission (5 cols) */}
          <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col overflow-hidden bg-gray-50/50">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                {taskType.startsWith('speaking') ? 'Candidate Spoken Transcript' : 'Student Submitted Essay'}
                <span className="text-[11px] font-normal text-gray-400 font-sans">
                  ({wordsCount} words)
                </span>
              </span>
              <button
                onClick={handleCopySubmission}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-200/60 transition-colors"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white rounded-xl border border-gray-200 shadow-2xs text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap select-text">
              {submission.fullContent}
            </div>
          </div>

          {/* Right Column: IELTS Examiner Evaluation (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-6 bg-white">
            {!evaluation ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Paper Not Marked Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Run the official IELTS Examiner assessment to score this paper against the 4 band descriptor pillars.
                </p>
                <button
                  onClick={() => onRegrade(submission)}
                  disabled={isGrading}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-xs"
                >
                  {isGrading ? 'Evaluating Descriptors...' : 'Mark Paper Now'}
                </button>
              </div>
            ) : (
              <>
                {/* Official Band Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-indigo-50 border border-red-200/80 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white font-black text-2xl flex flex-col items-center justify-center shadow-md shadow-red-500/20">
                      <span>{currentBand.toFixed(1)}</span>
                      <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">OVERALL</span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Official Band Descriptors
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {evaluation.subScores.map((sub, i) => (
                          <div
                            key={i}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-center shadow-2xs"
                          >
                            <span className="text-[10px] font-bold text-gray-500 block">
                              {sub.criterionCode}
                            </span>
                            <span className="text-xs font-black text-gray-900">
                              {sub.band.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Academic Integrity / AI Check */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border bg-white shadow-2xs">
                    {evaluation.academicIntegrityCheck?.flagged ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 font-bold">Template / AI Patterns</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 font-bold">Authentic Writing</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Level-Sensitive Progression Roadmap */}
                {evaluation.levelSensitiveAdvice && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        Level-Sensitive Roadmap: Jump from Band {currentBand.toFixed(1)} to {evaluation.levelSensitiveAdvice.nextBandTarget.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {evaluation.levelSensitiveAdvice.targetTier}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {evaluation.levelSensitiveAdvice.currentLevelSummary}
                    </p>
                    <ul className="text-xs text-amber-900 space-y-1 pt-1">
                      {evaluation.levelSensitiveAdvice.actionableStepsToNextBand.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed 4-Pillar Rubric Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Pillar-by-Pillar Band Descriptors Evidence
                  </h4>

                  <div className="space-y-3">
                    {evaluation.subScores.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">
                            {sub.criterionName} ({sub.criterionCode})
                          </span>
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                            Band {sub.band.toFixed(1)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-red-400 pl-2.5">
                          "{sub.descriptorEvidence}"
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                          {sub.strengths.length > 0 && (
                            <div className="text-emerald-800">
                              <span className="font-bold text-[11px] block text-emerald-900">Positive Features:</span>
                              <ul className="list-disc list-inside">
                                {sub.strengths.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {sub.growthAreas.length > 0 && (
                            <div className="text-amber-800">
                              <span className="font-bold text-[11px] block text-amber-900">Limiting Factors:</span>
                              <ul className="list-disc list-inside">
                                {sub.growthAreas.map((g, i) => (
                                  <li key={i}>{g}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line-by-Line Error Corrections */}
                {evaluation.detailedCorrections && evaluation.detailedCorrections.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      Detailed Sentence Corrections &amp; Band Upgrades
                    </h4>

                    <div className="space-y-2">
                      {evaluation.detailedCorrections.map((corr, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                              {corr.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Impact: {corr.bandImpact}
                            </span>
                          </div>

                          <div className="line-through text-red-700 bg-red-50 p-1.5 rounded-md">
                            {corr.originalText}
                          </div>

                          <div className="text-emerald-800 font-semibold bg-emerald-50 p-1.5 rounded-md flex items-center gap-1">
                            <span>➔ {corr.correctedText}</span>
                          </div>

                          <p className="text-gray-500 text-[11px] pt-0.5">{corr.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary Upgrades Table */}
                {evaluation.vocabularyUpgrades && evaluation.vocabularyUpgrades.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-indigo-600" />
                      Band 7.5+ Lexical Upgrades &amp; Collocations
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {evaluation.vocabularyUpgrades.map((voc, idx) => (
                        <div key={idx} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/70 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 line-through">{voc.originalWordOrPhrase}</span>
                            <span className="font-bold text-indigo-800 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                              {voc.band7PlusAlternative}
                            </span>
                          </div>
                          <p className="text-indigo-900 text-[11px] italic">"{voc.contextUsage}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examiner Overall Commentary (Classroom Feedback) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">
                      Examiner Official Feedback to Student
                    </label>
                    <span className="text-[11px] text-gray-400">Synced to Google Classroom</span>
                  </div>
                  <textarea
                    rows={4}
                    value={overrideFeedback}
                    onChange={(e) => setOverrideFeedback(e.target.value)}
                    className="w-full text-xs text-gray-800 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 leading-relaxed"
                  />
                </div>

                {/* Teacher Band Override Slider */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-red-600" />
                      Teacher Band Score Adjustment
                    </span>
                    <button
                      onClick={handleApplyOverride}
                      className="text-xs font-bold text-red-600 hover:text-red-800"
                    >
                      Apply Adjustment
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={9}
                      step={0.5}
                      value={overrideBand}
                      onChange={(e) => setOverrideBand(Number(e.target.value))}
                      className="flex-1 accent-red-600"
                    />
                    <div className="flex items-center gap-1 font-mono text-base font-black text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1">
                      <span>Band {overrideBand.toFixed(1)}</span>
                      <span className="text-gray-400 font-normal text-xs">/ 9.0</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100"
          >
            Close Examiner
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyOverride}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100"
            >
              Save Internal Changes
            </button>

            <button
              onClick={() => onRequestSyncToClassroom(submission, overrideBand)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Sync Band {overrideBand.toFixed(1)} to Classroom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
