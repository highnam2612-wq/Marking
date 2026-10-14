import React from 'react';
import {
  BarChart3,
  Award,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentSubmission, CourseWork, IELTSTaskType, IELTSTargetTier } from '../types/index.ts';

interface ClassAnalyticsProps {
  currentCourseWork: CourseWork | null;
  submissions: StudentSubmission[];
  taskType: IELTSTaskType;
  targetTier: IELTSTargetTier;
}

export const ClassAnalytics: React.FC<ClassAnalyticsProps> = ({
  currentCourseWork,
  submissions,
  taskType,
  targetTier,
}) => {
  const gradedSubmissions = submissions.filter((s) => s.ieltsEvaluation || s.draftGrade !== undefined);

  if (gradedSubmissions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800">No IELTS Papers Marked Yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
          Once you mark candidate submissions, cohort band distributions, sub-score averages, and target readiness will display here.
        </p>
      </div>
    );
  }

  // Calculate bands
  const bands = gradedSubmissions.map((s) => {
    return s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
  });

  const avgBand = (bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1);
  const maxBand = Math.max(...bands).toFixed(1);
  const minBand = Math.min(...bands).toFixed(1);

  // Band buckets
  const bandDist = {
    expert: 0, // 8.0 - 9.0
    advanced: 0, // 7.0 - 7.5
    competent: 0, // 6.0 - 6.5
    modest: 0, // 5.0 - 5.5
    limited: 0, // < 5.0
  };

  bands.forEach((b) => {
    if (b >= 8.0) bandDist.expert++;
    else if (b >= 7.0) bandDist.advanced++;
    else if (b >= 6.0) bandDist.competent++;
    else if (b >= 5.0) bandDist.modest++;
    else bandDist.limited++;
  });

  // Calculate 4 pillars averages
  const pillarStats: Record<string, { total: number; count: number }> = {};
  gradedSubmissions.forEach((s) => {
    s.ieltsEvaluation?.subScores.forEach((ss) => {
      const code = ss.criterionCode;
      if (!pillarStats[code]) {
        pillarStats[code] = { total: 0, count: 0 };
      }
      pillarStats[code].total += ss.band;
      pillarStats[code].count++;
    });
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Candidate Name',
      'Email',
      'Overall Band',
      'Pillar 1',
      'Pillar 2',
      'Pillar 3',
      'Pillar 4',
      'Examiner Comments',
    ];
    const rows = gradedSubmissions.map((s) => {
      const ob = s.teacherOverrideBand ?? s.ieltsEvaluation?.overallBand ?? s.draftGrade ?? 6.0;
      const s1 = s.ieltsEvaluation?.subScores[0]?.band ?? '';
      const s2 = s.ieltsEvaluation?.subScores[1]?.band ?? '';
      const s3 = s.ieltsEvaluation?.subScores[2]?.band ?? '';
      const s4 = s.ieltsEvaluation?.subScores[3]?.band ?? '';
      const comments = (s.teacherOverrideFeedback || s.ieltsEvaluation?.examinerComments || '').replace(/"/g, '""');
      return [
        `"${s.studentName}"`,
        `"${s.studentEmail || ''}"`,
        ob.toFixed(1),
        s1,
        s2,
        s3,
        s4,
        `"${comments}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentCourseWork?.title || 'IELTS_Class'}_BandScores.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            IELTS Cohort Band Distribution &amp; Descriptor Analysis
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Aggregated official examiner metrics across {gradedSubmissions.length} marked candidate submissions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export IELTS Band Scores CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cohort Mean Band</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-700">Band {avgBand}</span>
            <span className="text-xs text-gray-400">/ 9.0</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Achiever</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">Band {maxBand}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lowest Band</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">Band {minBand}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target {targetTier} Readiness</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-700">
              {Math.round(
                ((bandDist.expert + bandDist.advanced) / gradedSubmissions.length) * 100
              )}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Band Tier Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Cohort Band Distribution</h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Band 8.0 - 9.0 (Very Good / Expert)', count: bandDist.expert, color: 'bg-emerald-600' },
              { label: 'Band 7.0 - 7.5 (Good User)', count: bandDist.advanced, color: 'bg-blue-600' },
              { label: 'Band 6.0 - 6.5 (Competent User)', count: bandDist.competent, color: 'bg-indigo-600' },
              { label: 'Band 5.0 - 5.5 (Modest User)', count: bandDist.modest, color: 'bg-amber-500' },
              { label: 'Band < 5.0 (Limited User)', count: bandDist.limited, color: 'bg-red-500' },
            ].map((tier, idx) => {
              const pct =
                gradedSubmissions.length > 0
                  ? Math.round((tier.count / gradedSubmissions.length) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{tier.label}</span>
                    <span className="text-gray-500">
                      {tier.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Pillars Average Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900">4-Pillar Band Averages</h3>

          <div className="space-y-3 pt-2">
            {Object.entries(pillarStats).map(([code, stat], idx) => {
              const avg = stat.count > 0 ? (stat.total / stat.count).toFixed(1) : '0.0';
              const pct = Math.round((Number(avg) / 9) * 100);

              const nameMap: Record<string, string> = {
                TR: 'Task Response (TR)',
                TA: 'Task Achievement (TA)',
                CC: 'Coherence & Cohesion (CC)',
                LR: 'Lexical Resource (LR)',
                GRA: 'Grammatical Range & Accuracy (GRA)',
                FC: 'Fluency & Coherence (FC)',
                PR: 'Pronunciation (PR)',
              };

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{nameMap[code] || code}</span>
                    <span className="text-gray-900 font-bold">
                      Band {avg} / 9.0
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
