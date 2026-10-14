import { GoogleGenAI, Type } from '@google/genai';
import {
  IELTSTaskType,
  IELTSTargetTier,
  IELTSBenchmarkPaper,
  IELTSEvaluationResult,
} from '../types/index.ts';

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface IELTSGradingRequest {
  studentName: string;
  submissionText: string;
  taskType: IELTSTaskType;
  promptQuestion: string;
  targetTier: IELTSTargetTier;
  examinerStrictness: 'idp_standard' | 'strict_mock' | 'encouraging_coaching';
  customDirectives: string;
  benchmarkVault: IELTSBenchmarkPaper[];
}

export async function evaluateIELTSSubmission(req: IELTSGradingRequest): Promise<IELTSEvaluationResult> {
  const ai = getGeminiClient();

  const isSpeaking = req.taskType.startsWith('speaking');

  // Select top relevant benchmark exemplars from user's vault
  const relevantBenchmarks = req.benchmarkVault
    .filter((b) => (isSpeaking ? b.taskType.startsWith('speaking') : !b.taskType.startsWith('speaking')))
    .slice(0, 4);

  const benchmarksPrompt = relevantBenchmarks.length > 0
    ? relevantBenchmarks.map((b, i) => `=== BENCHMARK EXEMPLAR #${i + 1} (From Teacher's Marked Vault / NotebookLM) ===
Prompt: ${b.prompt}
Student Sample:
"""
${b.studentContent.slice(0, 1200)}
"""
Official Band Awarded: Overall Band ${b.bandScores.overall} (${isSpeaking ? `FC:${b.bandScores.c1}, LR:${b.bandScores.c2}, GRA:${b.bandScores.c3}, PR:${b.bandScores.c4}` : `TR/TA:${b.bandScores.c1}, CC:${b.bandScores.c2}, LR:${b.bandScores.c3}, GRA:${b.bandScores.c4}`})
Teacher / Examiner Real Notes:
"""
${b.examinerFeedback}
"""`).join('\n\n')
    : 'No historical marked benchmarks provided. Calibrate strictly according to the official IELTS Band Descriptors.';

  const officialDescriptorsCriteria = isSpeaking
    ? `CRITERION 1: Fluency and Coherence (FC)
- Band 9: Speaks fluently with only rare repetition or self-correction; develops topics fully and coherently.
- Band 8: Speaks fluently with only occasional repetition/self-correction; develops topics coherently and flexibly.
- Band 7: Speaks at length without noticeable effort; may demonstrate language-related hesitation at times; uses a range of connectives and discourse markers with some flexibility.
- Band 6: Is willing to speak at length though may lose coherence at times; uses a range of connectives but not always appropriately.
- Band 5: Usually maintains flow of speech but uses repetition, self-correction, or slow speech to keep going; over-uses certain connectives.

CRITERION 2: Lexical Resource (LR)
- Band 9: Uses full flexibility and precise vocabulary in all topics; uses idiomatic language naturally.
- Band 8: Uses a wide vocabulary resource readily and flexibly; uses less common and idiomatic vocabulary skillfully.
- Band 7: Uses vocabulary resource flexibly to discuss a variety of topics; uses some less common and idiomatic vocabulary.
- Band 6: Has a wide enough vocabulary to discuss topics at length and make meaning clear; attempts paraphrase with mixed success.
- Band 5: Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility.

CRITERION 3: Grammatical Range and Accuracy (GRA)
- Band 9: Uses a full range of structures naturally and accurately; produces consistently accurate structures.
- Band 8: Uses a wide range of structures flexibly; the majority of sentences are error-free.
- Band 7: Uses a range of complex structures with some flexibility; produces frequent error-free sentences.
- Band 6: Uses a mix of simple and complex structures, but with limited flexibility; may make frequent errors with complex structures.
- Band 5: Produces basic sentence forms with reasonable accuracy; uses a limited range of more complex structures.

CRITERION 4: Pronunciation (PR)
- Band 9: Uses full range of phonological features to convey precise and subtle meaning.
- Band 8: Uses a wide range of phonological features; can be understood easily throughout.
- Band 7: Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8.
- Band 6: Uses a range of phonological features with mixed control; can generally be understood throughout.
- Band 5: Shows all the positive features of Band 4 and some of Band 6.`
    : `CRITERION 1: Task Response (TR - Task 2) / Task Achievement (TA - Task 1)
- Band 9: Fully addresses all parts of the task; presents a fully developed position with relevant, fully extended and well-supported ideas.
- Band 8: Sufficiently addresses all parts of the task; well-developed response with relevant, extended and supported ideas.
- Band 7: Addresses all parts of the task; clear position throughout; presents, extends and supports main ideas, but may over-generalize or have minor gaps.
- Band 6: Addresses all parts of the task though some parts may be more fully covered than others; presents a relevant position though conclusions may be unclear; main ideas present but insufficiently developed.
- Band 5: Addresses the task only partially; expresses a position but development is not always clear; presents main ideas but some are repetitive or poorly developed.

CRITERION 2: Coherence and Cohesion (CC)
- Band 9: Uses cohesion in such a way that it attracts no attention; skillfully manages paragraphing.
- Band 8: Sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing appropriately.
- Band 7: Logically organizes information and ideas; clear progression throughout; uses a range of cohesive devices appropriately though there may be some under-/over-use; presents a clear central topic within each paragraph.
- Band 6: Arranges information and ideas coherently; clear overall progression; uses cohesive devices effectively, but cohesion within/between sentences may be faulty or mechanical; paragraphing used but not always logically.
- Band 5: Presents information with some organization but there may be a lack of overall progression; inadequate, inaccurate or over-used cohesive devices.

CRITERION 3: Lexical Resource (LR)
- Band 9: Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor 'slips'.
- Band 8: Uses a wide range of vocabulary fluently and flexibly; skillfully uses uncommon lexical items with occasional slips in collocation.
- Band 7: Uses a sufficient range of vocabulary to allow some flexibility and precision; uses less common lexical items with awareness of style and collocation; occasional errors.
- Band 6: Uses an adequate range of vocabulary for the task; attempts less common vocabulary but with some inaccuracy; errors do not impede communication.
- Band 5: Limited range of vocabulary, minimally adequate; noticeable errors in spelling/word formation that may cause difficulty.

CRITERION 4: Grammatical Range and Accuracy (GRA)
- Band 9: Uses a wide range of structures with full flexibility and accuracy; rare minor 'slips'.
- Band 8: Uses a wide range of structures; the majority of sentences are error-free; only rare non-systematic errors.
- Band 7: Uses a variety of complex structures; produces frequent error-free sentences; good control of grammar and punctuation.
- Band 6: Uses a mix of simple and complex sentence forms; makes some errors in grammar and punctuation, but they rarely reduce communication.
- Band 5: Uses only a limited range of structures; attempts complex sentences but with frequent errors; errors cause some difficulty.`;

  const systemInstruction = `You are an elite, certified Senior IELTS Examiner and Academic Language Coach.
You mark student submissions strictly adhering to the official IELTS Band Descriptors (public version published by British Council, IDP, and Cambridge English).

CRITICAL GRADING RULES:
1. Exact IELTS Bands: Sub-scores and Overall Band MUST be valid IELTS band scores (increments of 0.5: e.g. 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0).
   The overall band is the arithmetic average of the 4 sub-scores, rounded according to official IELTS rules:
   - If average ends in .25 -> round UP to next half band (e.g. 6.25 -> 6.5)
   - If average ends in .75 -> round UP to next whole band (e.g. 6.75 -> 7.0)
   - If average ends in .125 -> round down to .0 (e.g. 6.125 -> 6.0)
   - If average ends in .625 -> round down to .5 (e.g. 6.625 -> 6.5)
2. Task Type: ${req.taskType}.
   - If writing_task1: Criteria are TA, CC, LR, GRA.
   - If writing_task2: Criteria are TR, CC, LR, GRA.
   - If speaking: Criteria are FC, LR, GRA, PR.
3. Level Sensitivity (Class Target: ${req.targetTier}):
   - Calibrate feedback directly to this target band level!
   - For 5.0-5.5 target: Emphasize fundamental sentence boundaries, subject-verb agreements, clear paragraph separation, and basic lexical variety.
   - For 6.0-6.5 target: Emphasize avoiding repetitive cohesive devices, developing main arguments fully, and upgrading high-frequency generic words.
   - For 7.0-7.5+ target: Rigorously audit nuance, over-generalization, natural collocations, subtle syntactic variety, and discourse flow.
4. Style Calibration from Historical Benchmarks:
   Emulate the grading strictness and examiner phrasing demonstrated in the teacher's benchmark exemplar vault below.
5. Actionable Corrections:
   Extract at least 3 to 6 actual problematic or improvable sentences from the student's text. Show the exact original sentence, a Band 7.5+ rewrite, and explain the grammatical/lexical justification.
6. Custom Teacher Directives:
   "${req.customDirectives || 'Be strict on task response and provide high-value lexical upgrades.'}"`;

  const userPrompt = `IELTS PROMPT / QUESTION:
${req.promptQuestion || 'Standard IELTS Examination Task'}

STUDENT NAME: ${req.studentName}
STUDENT SUBMITTED WORK / TRANSCRIPT:
"""
${req.submissionText}
"""

============================================================
OFFICIAL IELTS BAND DESCRIPTORS:
${officialDescriptorsCriteria}
============================================================

============================================================
TEACHER'S HISTORICAL MARKED BENCHMARKS (Style Calibration):
${benchmarksPrompt}
============================================================

Conduct an official examiner assessment and return the structured JSON output.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.15, // Low temperature for high precision and consistent band calculation
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallBand: { type: Type.NUMBER, description: 'Overall IELTS band (e.g. 6.5, 7.0)' },
          taskType: { type: Type.STRING },
          subScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterionCode: { type: Type.STRING, description: 'TR, TA, CC, LR, GRA, FC, or PR' },
                criterionName: { type: Type.STRING },
                band: { type: Type.NUMBER },
                descriptorEvidence: { type: Type.STRING, description: 'Citation from official descriptor explaining why this band was awarded' },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                growthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['criterionCode', 'criterionName', 'band', 'descriptorEvidence', 'strengths', 'growthAreas'],
            },
          },
          summary: { type: Type.STRING, description: '2-3 sentence overview of performance' },
          examinerComments: { type: Type.STRING, description: 'Formal examiner commentary written to the student' },
          levelSensitiveAdvice: {
            type: Type.OBJECT,
            properties: {
              currentLevelSummary: { type: Type.STRING },
              targetTier: { type: Type.STRING },
              nextBandTarget: { type: Type.NUMBER },
              actionableStepsToNextBand: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['currentLevelSummary', 'targetTier', 'nextBandTarget', 'actionableStepsToNextBand'],
          },
          detailedCorrections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalText: { type: Type.STRING },
                correctedText: { type: Type.STRING },
                type: { type: Type.STRING, description: 'grammar, vocabulary, cohesion, task_response, pronunciation' },
                explanation: { type: Type.STRING },
                bandImpact: { type: Type.STRING },
              },
              required: ['originalText', 'correctedText', 'type', 'explanation', 'bandImpact'],
            },
          },
          vocabularyUpgrades: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalWordOrPhrase: { type: Type.STRING },
                band7PlusAlternative: { type: Type.STRING },
                contextUsage: { type: Type.STRING },
              },
              required: ['originalWordOrPhrase', 'band7PlusAlternative', 'contextUsage'],
            },
          },
          wordCount: { type: Type.NUMBER },
          academicIntegrityCheck: {
            type: Type.OBJECT,
            properties: {
              flagged: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              severity: { type: Type.STRING },
            },
            required: ['flagged', 'reason', 'severity'],
          },
        },
        required: [
          'overallBand',
          'subScores',
          'summary',
          'examinerComments',
          'levelSensitiveAdvice',
          'detailedCorrections',
          'vocabularyUpgrades',
          'academicIntegrityCheck',
        ],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}') as IELTSEvaluationResult;
  return parsed;
}

export async function parseBulkBenchmarkData(rawText: string): Promise<IELTSBenchmarkPaper[]> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: `You are a data ingestion engine for an IELTS teacher's marked essay repository.
Parse the following raw text / CSV / JSON / NotebookLM export into structured IELTS benchmark records.
Extract prompt, student text, sub-scores (TR/TA/FC, CC/LR, LR/GRA, GRA/PR), overall band, and examiner feedback.

RAW INPUT:
"""
${rawText.slice(0, 30000)}
"""`,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          papers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                taskType: { type: Type.STRING, description: 'writing_task1, writing_task2, or speaking' },
                prompt: { type: Type.STRING },
                studentContent: { type: Type.STRING },
                bandScores: {
                  type: Type.OBJECT,
                  properties: {
                    c1: { type: Type.NUMBER },
                    c2: { type: Type.NUMBER },
                    c3: { type: Type.NUMBER },
                    c4: { type: Type.NUMBER },
                    overall: { type: Type.NUMBER },
                  },
                  required: ['c1', 'c2', 'c3', 'c4', 'overall'],
                },
                examinerFeedback: { type: Type.STRING },
                source: { type: Type.STRING },
              },
              required: ['id', 'title', 'taskType', 'prompt', 'studentContent', 'bandScores', 'examinerFeedback'],
            },
          },
        },
        required: ['papers'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{"papers":[]}');
  return parsed.papers || [];
}
