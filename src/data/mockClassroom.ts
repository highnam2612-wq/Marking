import {
  ClassroomCourse,
  CourseWork,
  StudentSubmission,
  IELTSBenchmarkPaper,
} from '../types/index.ts';

export const INITIAL_BENCHMARK_VAULT: IELTSBenchmarkPaper[] = [
  {
    id: 'bm-1',
    title: 'Benchmark Band 8.0: Environmental Tax & Economy (Task 2)',
    taskType: 'writing_task2',
    prompt: 'Some people believe that environmental problems should be solved by international governments, while others think individual actions are more important. Discuss both views and give your opinion.',
    studentContent: `It is often debated whether global environmental crises should be addressed by transnational authorities or if the onus primarily lies with private citizens. While personal stewardship undeniably fosters grassroots consciousness, I contend that systemic governmental intervention and international treaties are far more consequential in combating planetary degradation.

Advocates of individual accountability assert that collective grassroots changes can curb carbon footprints. Daily lifestyle modifications, such as utilizing public transit, minimizing single-use plastics, and adopting plant-based diets, signal consumer demand to commercial enterprises. For instance, the surging popularity of zero-waste stores in Scandinavian nations demonstrates how aggregated citizen choices can pressure retailers toward ethical packaging. Furthermore, civic responsibility cultivates an environmentally cognizant electorate that holds corporations accountable.

Nevertheless, the catastrophic scale of climate instability necessitates regulatory power that transcends private goodwill. Industrial pollution, deforestation, and fossil-fuel dependence are driven by multinational conglomerates that will not self-regulate absent stringent legislation. International accords, such as the Paris Agreement, enforce legally binding emission caps and incentivize carbon capture innovation through subsidies and tariffs. Without high-level intergovernmental coordination, individual sacrifices remain mere drops in an ocean of corporate emission.

In conclusion, although individual lifestyle choices cultivate ethical stewardship, decisive progress hinges upon sovereign policy enforcement and global geopolitical consensus. International governance alone possesses the legislative mandate and economic leverage to engineer meaningful ecological restoration.`,
    bandScores: {
      c1: 8.0, // TR
      c2: 8.0, // CC
      c3: 8.5, // LR
      c4: 8.0, // GRA
      overall: 8.0,
    },
    examinerFeedback: `Outstanding essay. The position is articulated with exceptional clarity and nuanced progression throughout. Lexical resource demonstrates sophisticated collocations ('planetary degradation', 'multinational conglomerates', 'sovereign policy enforcement') used seamlessly. Sentence structures are varied with frequent error-free complex clauses.`,
    source: 'Teacher Historical Marking (NotebookLM Vault)',
    dateAdded: '2026-08-15',
  },
  {
    id: 'bm-2',
    title: 'Benchmark Band 6.5: Remote Working Benefits (Task 2)',
    taskType: 'writing_task2',
    prompt: 'In many countries, an increasing number of people are working from home. Do the advantages of this trend outweigh the disadvantages?',
    studentContent: `In recent years, working remotely has become increasingly popular across many societies due to technological advancements. In my opinion, although telecommuting can cause social isolation and blur work-life boundaries, its advantages in terms of flexibility and reduced commuting time are considerably more substantial.

On the one hand, teleworking poses noticeable challenges to employee well-being. When individuals work from their living rooms, they miss out on spontaneous daily interactions with colleagues, which can lead to feelings of loneliness and mental fatigue. Moreover, without physical boundaries between the office and personal life, many employees tend to overwork, answering emails late at night. For instance, a recent survey in Japan found that teleworkers reported higher rates of burnout than office-bound peers.

On the other hand, the benefits of telecommuting are hard to overlook. Primarily, employees save several hours each week by not commuting in heavy traffic, which drastically lowers their daily stress levels and financial expenditures on fuel and tickets. This saved time can be dedicated to family activities or physical exercise. Additionally, companies can save substantial capital on leasing commercial office spaces.

To sum up, while working from home can generate isolation and overworking issues, I believe the advantages in personal convenience and reduced commuting stress clearly outweigh the drawbacks.`,
    bandScores: {
      c1: 6.5, // TR
      c2: 6.5, // CC
      c3: 6.5, // LR
      c4: 6.5, // GRA
      overall: 6.5,
    },
    examinerFeedback: `A solid Band 6.5 performance. The writer presents a clear position and supports main ideas. Cohesive devices are used adequately though somewhat mechanically ('On the one hand', 'On the other hand', 'Primarily', 'Additionally'). Lexical range is adequate for the task with some good phrases ('telecommuting', 'commercial office spaces', 'mental fatigue'), but lacks the natural idiomatic precision of Band 7.5+.`,
    source: 'Past Class Marked Essay',
    dateAdded: '2026-09-02',
  },
  {
    id: 'bm-3',
    title: 'Benchmark Band 5.5: Fast Food Consumption (Task 2)',
    taskType: 'writing_task2',
    prompt: 'Fast food is becoming more popular around the world. Why is this happening and what problems does it cause?',
    studentContent: `Nowadays, fast food is very popular all around the world and many people eat it everyday. There are many reasons for this situation and it also causes some serious problems for health and society.

First of all, fast food is popular because people are very busy with their work and study. They do not have time to cook food at home so they just go to KFC or McDonald to buy quick meals. Another reason is that fast food is very cheap and delicious. For example, young students can buy a burger for two dollars.

However, eating too much fast food brings bad problems. The main problem is that fast food contains a lot of fat and sugar which makes people get obesity and diabetes. Also, eating fast food makes family members not talk to each other because they don't eat traditional dinner together.

In conclusion, fast food is popular because of busy life and cheap price, but it causes health disease and affects family relationship. People should control their diet.`,
    bandScores: {
      c1: 5.5, // TR
      c2: 5.5, // CC
      c3: 5.5, // LR
      c4: 5.0, // GRA
      overall: 5.5,
    },
    examinerFeedback: `Band 5.5. The essay addresses both parts of the question, but ideas are expressed in basic terms with little development or evidence. Cohesive linkers are basic and repetitive ('First of all', 'Another reason', 'However', 'In conclusion'). Vocabulary is limited with high-frequency simple words ('very popular', 'bad problems', 'health disease'). Grammatical range is restricted to basic simple and compound sentences with occasional errors in collocation and pluralization.`,
    source: 'NotebookLM Foundation Training Set',
    dateAdded: '2026-09-12',
  },
  {
    id: 'bm-4',
    title: 'Benchmark Band 7.5: Speaking Part 2 & 3 (Memorable Journey & Cultural Tourism)',
    taskType: 'speaking_part2',
    prompt: 'Describe a memorable journey you have made. You should say: where you went, how you travelled, why you went there, and explain why it was memorable.',
    studentContent: `(Transcript of Candidate Response):
I'd like to talk about a backpacking trip I took across the northern highlands of Vietnam, specifically the Ha Giang loop, roughly two years ago. I embarked on this excursion with two close university friends right after our graduation exams.

We decided to navigate the mountainous terrain on semi-automatic motorbikes, which was admittedly quite exhilarating yet terrifying at times due to the precipitous cliffs and serpentine roads. The primary purpose was really to decompress and disconnect from the relentless digital grind of city life. 

What made this journey truly unforgettable was not merely the breathtaking karst landscapes—though the view over Ma Pi Leng Pass was frankly awe-inspiring—but rather the spontaneous hospitality of the ethnic minority communities we encountered. On our second night, when our tire punctured in a remote hamlet near Dong Van, a local family welcomed us into their stilt house, shared their meal of smoked pork and home-brewed corn wine, and helped us patch up the bike without accepting any payment. That level of authentic warmth was deeply humbling and reshaped how I view human connection.`,
    bandScores: {
      c1: 8.0, // FC
      c2: 8.0, // LR
      c3: 7.5, // GRA
      c4: 7.5, // PR
      overall: 7.5,
    },
    examinerFeedback: `Band 7.5 Speaking performance. Candidate speaks at length effortlessly with natural discourse markers ('admittedly', 'not merely... but rather', 'frankly'). Rich, precise vocabulary ('precipitous cliffs', 'serpentine roads', 'relentless digital grind', 'karst landscapes'). Uses a wide variety of complex sentences with high accuracy and natural rhythm.`,
    source: 'Teacher Audio Transcript Marking',
    dateAdded: '2026-09-28',
  },
];

export const MOCK_COURSES: ClassroomCourse[] = [
  {
    id: 'course-ielts-advanced',
    name: 'IELTS Masterclass 7.0+ (Writing & Speaking)',
    section: 'Evening Advanced Cohort',
    descriptionHeading: 'Rigorous training for Band 7.0 to 8.5 targeting university admissions and migration.',
    room: 'Classroom 402',
    courseState: 'ACTIVE',
    defaultTier: '7.0-7.5',
  },
  {
    id: 'course-ielts-foundation',
    name: 'IELTS Foundation & Intermediate (Band 5.5 - 6.5)',
    section: 'Weekend Intensive',
    descriptionHeading: 'Core sentence restructuring, paragraph cohesion, and fluency conditioning.',
    room: 'Classroom 201',
    courseState: 'ACTIVE',
    defaultTier: '6.0-6.5',
  },
  {
    id: 'course-ielts-speaking-lab',
    name: 'IELTS Speaking & Pronunciation Workshop',
    section: 'Mon/Wed Speaking Lab',
    descriptionHeading: 'Fluency drills, lexical idiomaticity, and Part 2 & 3 cue card mastery.',
    room: 'Audio Lab B',
    courseState: 'ACTIVE',
    defaultTier: '6.5-7.0' as any,
  },
];

export const MOCK_COURSEWORK: Record<string, CourseWork[]> = {
  'course-ielts-advanced': [
    {
      id: 'cw-task2-ai-tech',
      courseId: 'course-ielts-advanced',
      title: 'Writing Task 2: Artificial Intelligence & Future Employment',
      description: 'Some people argue that artificial intelligence will eliminate millions of professional jobs and increase inequality, while others claim it will generate superior economic opportunities. Discuss both views and give your opinion. (Minimum 250 words, 40 minutes).',
      maxPoints: 9, // IELTS 9.0 Band scale
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 10, day: 22 },
      workType: 'ASSIGNMENT',
      ieltsTaskType: 'writing_task2',
      targetTier: '7.0-7.5',
    },
    {
      id: 'cw-task1-energy-chart',
      courseId: 'course-ielts-advanced',
      title: 'Writing Task 1: Renewable vs Fossil Fuel Production (1995-2025)',
      description: 'The line chart illustrates the global generation of energy from coal, natural gas, and renewables between 1995 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (Minimum 150 words).',
      maxPoints: 9,
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 10, day: 28 },
      workType: 'ASSIGNMENT',
      ieltsTaskType: 'writing_task1',
      targetTier: '7.0-7.5',
    },
    {
      id: 'cw-speaking-part2-journey',
      courseId: 'course-ielts-advanced',
      title: 'Speaking Part 2 & 3: Challenging Decisions & Future Career Paths',
      description: 'Describe a difficult decision that you had to make in your life. Explain what the options were, what decision you made, and how you felt afterwards. Submit your recorded speech or spoken transcript.',
      maxPoints: 9,
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 11, day: 2 },
      workType: 'ASSIGNMENT',
      ieltsTaskType: 'speaking_part2',
      targetTier: '7.0-7.5',
    },
  ],
  'course-ielts-foundation': [
    {
      id: 'cw-task2-traffic-congestion',
      courseId: 'course-ielts-foundation',
      title: 'Writing Task 2: Traffic Congestion & Public Transportation',
      description: 'Traffic congestion in major metropolitan areas is getting worse. What are the causes of this problem, and what measures can be taken to solve it? (Minimum 250 words).',
      maxPoints: 9,
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 10, day: 24 },
      workType: 'ASSIGNMENT',
      ieltsTaskType: 'writing_task2',
      targetTier: '6.0-6.5',
    },
  ],
};

export const MOCK_SUBMISSIONS: Record<string, StudentSubmission[]> = {
  'cw-task2-ai-tech': [
    {
      id: 'sub-ielts-1',
      courseId: 'course-ielts-advanced',
      courseWorkId: 'cw-task2-ai-tech',
      userId: 'user-nguyen-minh',
      studentName: 'Nguyen Minh Anh',
      studentEmail: 'minhanh.ielts@student.edu',
      state: 'TURNED_IN',
      draftGrade: undefined,
      gradingStatus: 'idle',
      fullContent: `The rapid proliferation of artificial intelligence has sparked contentious debate regarding its ramifications for the global workforce. While detractors argue that automation will precipitate widespread unemployment and exacerbate socioeconomic disparity, proponents maintain that it will catalyze unprecedented productivity and unlock higher-tier vocational opportunities. In my perspective, while transitional disruptions are inevitable, AI will ultimately cultivate a more intellectually stimulating and technologically empowered job market.

On the one hand, apprehensions regarding job displacement are well-founded, particularly in sectors dependent on algorithmic and repetitive labor. Routine cognitive roles such as data entry, preliminary legal analysis, and customer support are increasingly rendered obsolete by large language models. The rapid pace of this transition threatens to outstrip the reskilling capacity of displaced laborers, potentially widening wealth stratification between technological proprietors and manual workers. A poignant example is found in the financial industry, where automated algorithmic trading systems have largely displaced human floor traders.

On the other hand, historical technological revolutions demonstrate that technological paradigm shifts consistently generate more occupational niches than they annihilate. The ascension of artificial intelligence is fostering burgeoning industries centered around machine learning architecture, ethical AI governance, and prompt engineering. Furthermore, by delegating tedious computational tasks to intelligent algorithms, human employees can pivot toward endeavors requiring empathetic discernment, creative conceptualization, and strategic synthesis—facets that machines cannot autonomously replicate.

In conclusion, although the automation of clerical tasks poses non-negligible friction for mid-tier workers in the short term, I firmly contend that artificial intelligence will not cause systemic structural destitution. Provided that educational institutions and governments proactively engineer reskilling initiatives, AI will act as a cognitive amplifier rather than an occupational guillotine.`,
    },
    {
      id: 'sub-ielts-2',
      courseId: 'course-ielts-advanced',
      courseWorkId: 'cw-task2-ai-tech',
      userId: 'user-tran-duc',
      studentName: 'Tran Duc Huy',
      studentEmail: 'duchuy.tran@student.edu',
      state: 'TURNED_IN',
      draftGrade: undefined,
      gradingStatus: 'idle',
      fullContent: `Nowadays, artificial intelligence is developing very fast and changing the way people work in every country. Some people think that AI will take away millions of jobs and make people become poor, but other people believe it will create new jobs and make the economy grow bigger. In this essay, I will discuss both sides of this argument and give my own opinion.

On the one hand, it is true that many workers might lose their jobs because of robot automation. Machines can work 24/7 without getting tired or needing salary, so company bosses will prefer to use computers instead of hiring human staff. For example, in many supermarkets today, self-checkout machines have replaced real cashiers, leaving many uneducated people unemployed. If this continues, the gap between rich and poor will become bigger and bigger.

On the other hand, AI can help humans work faster and create new professions. When new technology appears, people need to learn new skills to control it. For instance, people can work as computer programmers, AI technicians, or data analysts. Furthermore, AI can do dangerous jobs like mining or bomb disposal, so humans can be safer at workplace.

In conclusion, I think AI will take some traditional jobs away, but it will also open new opportunities for educated people. Therefore, governments should train people to use computers so they will not be left behind in the future.`,
    },
    {
      id: 'sub-ielts-3',
      courseId: 'course-ielts-advanced',
      courseWorkId: 'cw-task2-ai-tech',
      userId: 'user-le-ha-my',
      studentName: 'Le Ha My',
      studentEmail: 'hamy.le@student.edu',
      state: 'TURNED_IN',
      draftGrade: undefined,
      gradingStatus: 'idle',
      fullContent: `Artificial intelligence is one of the most controversial topics in modern society. While some fear it will eliminate millions of professional careers, others anticipate a golden age of productivity. In my view, artificial intelligence will fundamentally reshape employment, and while some professions will undoubtedly disappear, the overall net benefit to human productivity will be overwhelmingly positive.

Critics of AI point out that white-collar professions are no longer immune to automation. For decades, automation primarily threatened blue-collar manufacturing; however, modern generative models can now produce legal briefs, write computer code, and diagnose medical radiographs with equal or superior speed to human experts. Consequently, entry-level professionals may struggle to find foundational training positions if law firms and tech companies rely exclusively on synthetic outputs. This could lead to a hollowed-out workforce and severe underemployment among university graduates.

Nevertheless, AI should be viewed as a tool of augmentation rather than outright replacement. In medicine, for example, radiologists who collaborate with diagnostic algorithms demonstrate significantly lower diagnostic error rates than either algorithms or human doctors acting alone. By liberating professionals from administrative drudgery, AI enables workers to focus on nuanced ethical judgment and complex problem-solving. New vocational domains—such as AI ethics auditors and synthetic data curators—are already emerging to manage these complex systems.

To sum up, while the transitional displacement of entry-level workers presents a genuine policy dilemma, artificial intelligence will ultimately elevate human labor rather than destroy it. Society must focus on agile workforce retraining rather than resisting inevitable technological progress.`,
    },
    {
      id: 'sub-ielts-4',
      courseId: 'course-ielts-advanced',
      courseWorkId: 'cw-task2-ai-tech',
      userId: 'user-pham-quoc',
      studentName: 'Pham Quoc Bao',
      studentEmail: 'quocbao.pham@student.edu',
      state: 'TURNED_IN',
      draftGrade: undefined,
      gradingStatus: 'idle',
      fullContent: `AI is becoming very popular today. Many people worry that AI will take their jobs and cause unemployment everywhere. However, some people think AI is good because it makes life easier. I agree that AI has both positive and negative points.

First, AI can do jobs much faster than humans. For example, computers can calculate numbers and answer customer questions in just a few seconds. Because of this, companies don't need to hire many employees, so many workers will lose their income and can't feed their families. This is a very big problem for poor people.

Second, AI also creates some good chances for modern businesses. People can use AI to write emails, translate languages, and search information quickly. Also, students can use AI to do homework and study English better. If people know how to use AI, they can work very fast and make more money.

In conclusion, AI will change the world a lot. It will delete some jobs but also bring new chances. People must study hard to adapt to this new technology.`,
    },
  ],
};
