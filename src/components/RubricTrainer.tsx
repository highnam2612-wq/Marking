import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  FileSpreadsheet,
  Upload,
  ExternalLink,
  Target,
  Sliders,
  CheckCircle2,
  BrainCircuit,
  FileText,
  Mic,
  Copy,
  Layers,
  Check,
} from 'lucide-react';
import {
  IELTSBenchmarkPaper,
  IELTSGradingConfig,
  IELTSTaskType,
  IELTSTargetTier,
} from '../types/index.ts';

interface RubricTrainerProps {
  config: IELTSGradingConfig;
  onUpdateConfig: (updated: Partial<IELTSGradingConfig>) => void;
}

export const RubricTrainer: React.FC<RubricTrainerProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'descriptors' | 'calibration'>('vault');
  const [vaultFilter, setVaultFilter] = useState<'all' | 'writing' | 'speaking'>('all');

  // Bulk Import state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [isParsingBulk, setIsParsingBulk] = useState(false);
  const [bulkImportSuccessCount, setBulkImportSuccessCount] = useState<number | null>(null);

  // Manual single benchmark add
  const [isAddingSingle, setIsAddingSingle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<IELTSTaskType>('writing_task2');
  const [newPrompt, setNewPrompt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newOverall, setNewOverall] = useState<number>(7.0);
  const [newC1, setNewC1] = useState<number>(7.0);
  const [newC2, setNewC2] = useState<number>(7.0);
  const [newC3, setNewC3] = useState<number>(7.0);
  const [newC4, setNewC4] = useState<number>(7.0);
  const [newFeedback, setNewFeedback] = useState('');
  const [newSource, setNewSource] = useState('NotebookLM Export');

  // Handle bulk parser
  const handleRunBulkParse = async () => {
    if (!bulkInputText.trim()) return;
    setIsParsingBulk(true);
    try {
      const res = await fetch('/api/parse-benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: bulkInputText }),
      });

      if (!res.ok) throw new Error('Failed to parse input data');
      const data = await res.json();
      const parsedPapers: IELTSBenchmarkPaper[] = data.papers || [];

      if (parsedPapers.length > 0) {
        onUpdateConfig({
          benchmarkVault: [...config.benchmarkVault, ...parsedPapers],
        });
        setBulkImportSuccessCount(parsedPapers.length);
        setBulkInputText('');
        setTimeout(() => setBulkImportSuccessCount(null), 4000);
      } else {
        alert('No structured IELTS benchmark records could be parsed. Try pasting text containing student essay, scores, and feedback.');
      }
    } catch (e: any) {
      alert('Error parsing bulk data: ' + (e.message || 'Unknown'));
    } finally {
      setIsParsingBulk(false);
    }
  };

  // Handle manual add
  const handleSaveSingleBenchmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newPrompt.trim()) {
      alert('Please provide prompt and student submission.');
      return;
    }

    const newPaper: IELTSBenchmarkPaper = {
      id: `bm-${Date.now()}`,
      title: newTitle.trim() || `Marked IELTS Sample (${newOverall.toFixed(1)})`,
      taskType: newTaskType,
      prompt: newPrompt.trim(),
      studentContent: newContent.trim(),
      bandScores: {
        c1: Number(newC1),
        c2: Number(newC2),
        c3: Number(newC3),
        c4: Number(newC4),
        overall: Number(newOverall),
      },
      examinerFeedback: newFeedback.trim() || 'Official examiner commentary recorded.',
      source: newSource || 'Teacher Marked Essay',
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onUpdateConfig({
      benchmarkVault: [newPaper, ...config.benchmarkVault],
    });

    setIsAddingSingle(false);
    setNewTitle('');
    setNewPrompt('');
    setNewContent('');
    setNewFeedback('');
  };

  const handleDeleteBenchmark = (id: string) => {
    onUpdateConfig({
      benchmarkVault: config.benchmarkVault.filter((b) => b.id !== id),
    });
  };

  // Sample load from NotebookLM format
  const handleLoadNotebookLMSample = () => {
    const sample = `---
Source: NotebookLM IELTS Collection 2026
Title: Task 2 Band 7.5 - University Education vs Vocational Training
Task: writing_task2
Prompt: Some people believe that university education should be free for everyone, while others argue that individuals should pay for their own higher education. Discuss both views and give your opinion.
Score: 7.5 (TR: 7.5, CC: 7.5, LR: 7.5, GRA: 7.5)
Student Essay:
The subsidization of higher education remains a subject of intense socioeconomic contention. While advocates for tuition-free tertiary study highlight egalitarian access and intellectual enrichment, others maintain that self-funded education prevents fiscal strain on the welfare state. In my evaluation, while state-sponsored university study promotes social mobility, a cost-sharing model with income-contingent loans represents the most equitable approach.
Examiner Feedback:
Clear position presented throughout. Nuanced lexical choices like 'socioeconomic contention', 'egalitarian access', 'cost-sharing model'. Complex sentences handled with high accuracy.
---`;
    setBulkInputText(sample);
    setIsBulkImportOpen(true);
  };

  const filteredVault = config.benchmarkVault.filter((b) => {
    if (vaultFilter === 'writing') return !b.taskType.startsWith('speaking');
    if (vaultFilter === 'speaking') return b.taskType.startsWith('speaking');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-50 text-red-700 rounded-xl">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              IELTS Benchmark Vault &amp; Band Descriptor Calibration
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500 max-w-2xl">
            Input hundreds of your past marked IELTS Writing &amp; Speaking papers from NotebookLM or past classes. The Gemini machine learning engine uses your authentic examiner dataset to emulate your exact marking standards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Marked Vault ({config.benchmarkVault.length})
          </button>
          <button
            onClick={() => setActiveTab('descriptors')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'descriptors'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Official Band Descriptors
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'calibration'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Level &amp; Examiner Settings
          </button>
        </div>
      </div>

      {/* TAB 1: BENCHMARK VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Top Controls */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Filter by Skill:</span>
              <button
                onClick={() => setVaultFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vaultFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Papers ({config.benchmarkVault.length})
              </button>
              <button
                onClick={() => setVaultFilter('writing')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vaultFilter === 'writing' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Writing ({config.benchmarkVault.filter((b) => !b.taskType.startsWith('speaking')).length})
              </button>
              <button
                onClick={() => setVaultFilter('speaking')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vaultFilter === 'speaking' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Speaking ({config.benchmarkVault.filter((b) => b.taskType.startsWith('speaking')).length})
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadNotebookLMSample}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                title="Paste NotebookLM formatted past marked essays"
              >
                NotebookLM Format Demo
              </button>

              <button
                type="button"
                onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Bulk Import (100+ Papers)
              </button>

              <button
                type="button"
                onClick={() => setIsAddingSingle(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Marked Sample
              </button>
            </div>
          </div>

          {/* Success Banner if parsed */}
          {bulkImportSuccessCount && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Successfully imported {bulkImportSuccessCount} marked papers into your Benchmark Vault!</span>
            </div>
          )}

          {/* Bulk Import Drawer */}
          {isBulkImportOpen && (
            <div className="bg-white rounded-2xl border-2 border-indigo-400 p-6 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Bulk Import Marked Papers (NotebookLM, CSV, or Text)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Paste raw text or Markdown from your NotebookLM collections, spreadsheet exports, or previous marked classes. The AI will extract prompts, student responses, band scores, and your examiner feedback.
                  </p>
                </div>
                <button
                  onClick={() => setIsBulkImportOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>

              <textarea
                rows={7}
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                placeholder="Paste hundreds of marked essays or NotebookLM study guides here... (e.g. Prompt: ..., Student Essay: ..., Band: 7.0, Teacher Feedback: ...)"
                className="w-full text-xs font-mono border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Supports multiple essays separated by lines, markdown headers, or JSON/CSV.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkImportOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isParsingBulk || !bulkInputText.trim()}
                    onClick={handleRunBulkParse}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {isParsingBulk ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Parsing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Extract &amp; Load into Vault</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Single Modal Form */}
          {isAddingSingle && (
            <form
              onSubmit={handleSaveSingleBenchmark}
              className="bg-white rounded-2xl border-2 border-red-400 p-6 shadow-md space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Add Single Marked IELTS Benchmark</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingSingle(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Benchmark Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Band 7.5 Task 2 - Technology & Education"
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Task Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as IELTSTaskType)}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="writing_task2">Writing Task 2 (Essay)</option>
                    <option value="writing_task1">Writing Task 1 (Report/Chart)</option>
                    <option value="speaking_part1">Speaking Part 1</option>
                    <option value="speaking_part2">Speaking Part 2 (Cue Card)</option>
                    <option value="speaking_part3">Speaking Part 3</option>
                  </select>
                </div>
              </div>

              {/* Band Scores */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700 block mb-2">Official Band Scores Awarded:</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">Overall Band</label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={9}
                      value={newOverall}
                      onChange={(e) => setNewOverall(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">
                      {newTaskType.startsWith('speaking') ? 'FC (Fluency)' : 'TR / TA'}
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={9}
                      value={newC1}
                      onChange={(e) => setNewC1(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">
                      {newTaskType.startsWith('speaking') ? 'LR (Lexical)' : 'CC (Cohesion)'}
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={9}
                      value={newC2}
                      onChange={(e) => setNewC2(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">
                      {newTaskType.startsWith('speaking') ? 'GRA (Grammar)' : 'LR (Lexical)'}
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={9}
                      value={newC3}
                      onChange={(e) => setNewC3(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 text-center bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">
                      {newTaskType.startsWith('speaking') ? 'PR (Pronun.)' : 'GRA (Grammar)'}
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={9}
                      value={newC4}
                      onChange={(e) => setNewC4(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 text-center bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">IELTS Prompt / Question</label>
                <input
                  type="text"
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g. Some people think that universities should provide graduates with knowledge..."
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Student Essay / Spoken Transcript
                </label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste student work here..."
                  className="w-full text-xs font-mono border border-gray-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Teacher Examiner Feedback &amp; Justification
                </label>
                <textarea
                  rows={3}
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Explain why these bands were awarded..."
                  className="w-full text-xs border border-gray-300 rounded-lg p-3"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSingle(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                >
                  Save Benchmark Paper
                </button>
              </div>
            </form>
          )}

          {/* Benchmark Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredVault.map((paper) => {
              const isSpk = paper.taskType.startsWith('speaking');
              return (
                <div
                  key={paper.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
                        {paper.bandScores.overall.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900">{paper.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {paper.taskType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          Source: {paper.source || 'Teacher Vault'} {paper.dateAdded ? `• ${paper.dateAdded}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                        <span>{isSpk ? 'FC' : 'TR'}: {paper.bandScores.c1}</span>
                        <span className="text-gray-300">|</span>
                        <span>{isSpk ? 'LR' : 'CC'}: {paper.bandScores.c2}</span>
                        <span className="text-gray-300">|</span>
                        <span>{isSpk ? 'GRA' : 'LR'}: {paper.bandScores.c3}</span>
                        <span className="text-gray-300">|</span>
                        <span>{isSpk ? 'PR' : 'GRA'}: {paper.bandScores.c4}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteBenchmark(paper.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="text-xs text-gray-600 italic bg-gray-50/70 p-2.5 rounded-lg border border-gray-200/60">
                    <span className="font-bold not-italic text-gray-800">Prompt: </span>
                    {paper.prompt}
                  </div>

                  {/* Student Submission Excerpt */}
                  <div className="bg-white rounded-xl p-3 border border-gray-200 text-xs text-gray-800 font-sans max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {paper.studentContent}
                  </div>

                  {/* Teacher Feedback */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-900">Examiner Justification &amp; Notes:</span>
                    <p className="text-emerald-800 leading-relaxed">{paper.examinerFeedback}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL BAND DESCRIPTORS VIEWER */}
      {activeTab === 'descriptors' && (
        <div className="space-y-6">
          {/* Official PDF Reference links */}
          <div className="bg-gradient-to-r from-red-50/80 via-white to-indigo-50/80 border border-red-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Official Public Descriptors
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">
                Official IELTS Writing &amp; Speaking Rubrics
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                The AI grading engine implements these exact 4 criteria published by British Council, IDP, and Cambridge English.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-red-800 bg-red-100/80 hover:bg-red-200/80 border border-red-300 transition-colors"
              >
                <span>Writing Descriptors PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-indigo-800 bg-indigo-100/80 hover:bg-indigo-200/80 border border-indigo-300 transition-colors"
              >
                <span>Speaking Descriptors PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Criteria Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Writing Criteria */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <FileText className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">IELTS Writing Pillars (25% Each)</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    1. Task Response (Task 2) / Task Achievement (Task 1) [TR/TA]
                  </span>
                  <p className="text-gray-600">
                    Band 8-9: Fully developed position; all parts addressed with well-supported arguments.<br />
                    Band 6-7: Clear position; relevant main ideas but may over-generalize or lack depth.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    2. Coherence &amp; Cohesion [CC]
                  </span>
                  <p className="text-gray-600">
                    Band 8-9: Seamless, unobtrusive cohesive devices; masterfully managed paragraphing.<br />
                    Band 6-7: Clear progression throughout; some mechanical or repetitive linkers.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    3. Lexical Resource [LR]
                  </span>
                  <p className="text-gray-600">
                    Band 8-9: Wide lexical flexibility; sophisticated collocations; rare minor slips.<br />
                    Band 6-7: Sufficient range for task; attempts less common words with minor collocation errors.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    4. Grammatical Range &amp; Accuracy [GRA]
                  </span>
                  <p className="text-gray-600">
                    Band 8-9: Majority of sentences error-free; full syntactic flexibility.<br />
                    Band 6-7: Mix of complex and simple structures; frequent error-free sentences.
                  </p>
                </div>
              </div>
            </div>

            {/* Speaking Criteria */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <Mic className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">IELTS Speaking Pillars (25% Each)</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    1. Fluency &amp; Coherence [FC]
                  </span>
                  <p className="text-gray-600">
                    Speaks at length effortlessly; develops topics flexibly; minimal hesitations or self-repairs.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    2. Lexical Resource [LR]
                  </span>
                  <p className="text-gray-600">
                    Natural use of idiomatic expressions, paraphrasing flexibility, and topical vocabulary.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    3. Grammatical Range &amp; Accuracy [GRA]
                  </span>
                  <p className="text-gray-600">
                    Naturally embeds relative clauses, conditionals, passive voice, and complex structures.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="font-bold text-gray-900 block mb-1">
                    4. Pronunciation [PR]
                  </span>
                  <p className="text-gray-600">
                    Intonation, sentence stress, connected speech, rhythm, and clarity across all phonemes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEVEL SENSITIVITY & EXAMINER CALIBRATION */}
      {activeTab === 'calibration' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Level-Sensitive Feedback &amp; Examiner Strictness
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure how the AI calibrates feedback according to your class's current proficiency tier and your personal marking strictness.
            </p>
          </div>

          {/* Target Tier Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Class Target Proficiency Tier (Level-Sensitivity):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  id: '5.0-5.5',
                  name: 'Band 5.0 - 5.5 (Foundation)',
                  desc: 'Focus on eliminating run-ons, basic verb agreements, clear paragraphs, and simple vocabulary accuracy.',
                },
                {
                  id: '6.0-6.5',
                  name: 'Band 6.0 - 6.5 (Intermediate)',
                  desc: 'Focus on developing main ideas, reducing mechanical linkers, and building topic-specific vocabulary.',
                },
                {
                  id: '7.0-7.5',
                  name: 'Band 7.0 - 7.5 (Advanced)',
                  desc: 'Rigorously audit nuance, over-generalization, less common collocations, and complex sentence control.',
                },
                {
                  id: '8.0+',
                  name: 'Band 8.0+ (Examiner Mastery)',
                  desc: 'Near-native naturalness, precise idiomatic phrasing, subtle hedging, and flawless paragraph cohesion.',
                },
              ].map((tier) => {
                const isSelected = config.targetTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => onUpdateConfig({ targetTier: tier.id as IELTSTargetTier })}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{tier.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{tier.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Examiner Strictness */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Examiner Marking Persona &amp; Strictness:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'idp_standard',
                  title: 'IDP / British Council Official Standard',
                  desc: 'Balanced, official examiner stance following the public descriptor table directly.',
                },
                {
                  id: 'strict_mock',
                  title: 'Strict Mock Exam (Tough Marking)',
                  desc: 'Severe scrutiny on memorized templates, minor tangents, and punctuation errors.',
                },
                {
                  id: 'encouraging_coaching',
                  title: 'Formative Coaching & Encouragement',
                  desc: 'Celebrates partial attempts and offers the nearest actionable stepping stone to the next half band.',
                },
              ].map((item) => {
                const isSelected = config.examinerStrictness === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onUpdateConfig({ examinerStrictness: item.id as any })}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{item.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Directives */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Custom Teacher Directives (Your Personal Rules)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Add specific instructions (e.g. "Flag memorized phrases like 'It is undeniable that' or 'In a nutshell'", "For speaking, deduct if answer is under 3 sentences in Part 3", "Suggest Band 8 synonyms for words like 'important' or 'big'").
            </p>
            <textarea
              rows={3}
              value={config.customTeacherDirectives}
              onChange={(e) => onUpdateConfig({ customTeacherDirectives: e.target.value })}
              placeholder="e.g. Flag memorized idioms and provide native collocations..."
              className="w-full text-xs text-gray-800 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
