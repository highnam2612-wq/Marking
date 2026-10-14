import React from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  RefreshCw,
  LogOut,
  Sliders,
  CheckSquare,
  BarChart3,
  BookOpen,
  FlaskConical,
  Target,
  FileEdit,
  Mic,
} from 'lucide-react';
import { ClassroomCourse, CourseWork, IELTSTaskType, IELTSTargetTier } from '../types/index.ts';

interface HeaderProps {
  user: User | null;
  courses: ClassroomCourse[];
  selectedCourse: ClassroomCourse | null;
  courseWorkList: CourseWork[];
  selectedCourseWork: CourseWork | null;
  activeTab: 'submissions' | 'vault' | 'analytics';
  isSimulatedMode: boolean;
  isLoadingData: boolean;
  currentTaskType: IELTSTaskType;
  currentTargetTier: IELTSTargetTier;
  onChangeTaskType: (type: IELTSTaskType) => void;
  onChangeTargetTier: (tier: IELTSTargetTier) => void;
  onSelectCourse: (course: ClassroomCourse) => void;
  onSelectCourseWork: (cw: CourseWork) => void;
  onChangeTab: (tab: 'submissions' | 'vault' | 'analytics') => void;
  onToggleSimulatedMode: () => void;
  onRefreshData: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  courses,
  selectedCourse,
  courseWorkList,
  selectedCourseWork,
  activeTab,
  isSimulatedMode,
  isLoadingData,
  currentTaskType,
  currentTargetTier,
  onChangeTaskType,
  onChangeTargetTier,
  onSelectCourse,
  onSelectCourseWork,
  onChangeTab,
  onToggleSimulatedMode,
  onRefreshData,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-xs backdrop-blur-md bg-white/95">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-red-600/20 font-black text-sm tracking-wider">
              IELTS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 tracking-tight text-lg">ExaminerAI</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/80">
                  <Sparkles className="w-3 h-3 text-red-600" />
                  Band 9.0 Engine
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Official Band Descriptors • Level-Sensitive • NotebookLM Vault
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
            <button
              onClick={() => onChangeTab('submissions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'submissions'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Submissions &amp; Marking
            </button>
            <button
              onClick={() => onChangeTab('vault')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'vault'
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Benchmark Vault &amp; Training
            </button>
            <button
              onClick={() => onChangeTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Band Score Insights
            </button>
          </nav>

          {/* Right Area: Demo toggle, Refresh, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo / Sandbox Switch */}
            <button
              onClick={onToggleSimulatedMode}
              title="Toggle between live Google Classroom sync and sample IELTS classes"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSimulatedMode
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <FlaskConical className={`w-3.5 h-3.5 ${isSimulatedMode ? 'text-amber-600' : 'text-gray-500'}`} />
              <span className="hidden sm:inline">
                {isSimulatedMode ? 'Sample IELTS Class' : 'Live Classroom'}
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefreshData}
              disabled={isLoadingData}
              title="Refresh Classroom assignments and student work"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-red-600' : ''}`} />
            </button>

            {/* Google Sign In / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'IELTS Teacher'}
                    className="w-8 h-8 rounded-full border border-gray-300 ring-2 ring-red-400/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'T')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[120px]">
                    {user.displayName || 'IELTS Examiner'}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-2xs hover:bg-gray-50 text-xs font-medium text-gray-700 transition-all cursor-pointer"
              >
                <div className="gsi-material-button-icon shrink-0">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 h-4 block"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span>Classroom Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar: Classroom Course, Assignment, Task Type & Level Sensitivity */}
      <div className="bg-gray-50/90 border-t border-gray-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Class & Assignment Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Class:</span>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const c = courses.find((x) => x.id === e.target.value);
                  if (c) onSelectCourse(c);
                }}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-2xs focus:ring-2 focus:ring-red-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `(${c.section})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Task:</span>
              <select
                value={selectedCourseWork?.id || ''}
                onChange={(e) => {
                  const cw = courseWorkList.find((x) => x.id === e.target.value);
                  if (cw) onSelectCourseWork(cw);
                }}
                disabled={courseWorkList.length === 0}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-2xs focus:ring-2 focus:ring-red-500 max-w-[280px] truncate"
              >
                {courseWorkList.length === 0 ? (
                  <option value="">No CourseWork Available</option>
                ) : (
                  courseWorkList.map((cw) => (
                    <option key={cw.id} value={cw.id}>
                      {cw.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* IELTS Controls: Task Type & Target Tier Level Sensitivity */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Task Type Switcher */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-2xs">
              {currentTaskType.startsWith('speaking') ? (
                <Mic className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <FileEdit className="w-3.5 h-3.5 text-red-600" />
              )}
              <select
                value={currentTaskType}
                onChange={(e) => onChangeTaskType(e.target.value as IELTSTaskType)}
                className="text-xs font-bold text-gray-800 bg-transparent focus:outline-hidden"
              >
                <option value="writing_task2">Writing Task 2 (Essay)</option>
                <option value="writing_task1">Writing Task 1 (Report/Chart)</option>
                <option value="speaking_part1">Speaking Part 1 (Interview)</option>
                <option value="speaking_part2">Speaking Part 2 (Cue Card)</option>
                <option value="speaking_part3">Speaking Part 3 (Discussion)</option>
              </select>
            </div>

            {/* Level Sensitivity Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1 shadow-2xs">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Level Target:</span>
              <select
                value={currentTargetTier}
                onChange={(e) => onChangeTargetTier(e.target.value as IELTSTargetTier)}
                className="text-xs font-bold text-gray-900 bg-transparent focus:outline-hidden"
              >
                <option value="5.0-5.5">Band 5.0 - 5.5 (Foundation)</option>
                <option value="6.0-6.5">Band 6.0 - 6.5 (Intermediate)</option>
                <option value="7.0-7.5">Band 7.0 - 7.5 (Advanced Target)</option>
                <option value="8.0+">Band 8.0+ (Examiner Mastery)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
