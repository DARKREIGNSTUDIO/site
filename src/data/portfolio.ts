export interface ProjectItem {
  id: string;
  n: string;
  t: string;
  d: string;
  c: string[];
  i: string[];
  pt?: boolean;
  phMain?: string;
  phSub?: string;
}

export interface SkillCategory {
  title: string;
  chips: string[];
}

export interface InfoRow {
  label: string;
  value: string;
  ltr?: boolean;
}

export interface StatCounter {
  n: number;
  label: string;
}

export const CONTACT_INFO = {
  email: 'armin83mz@gmail.com',
};

export const ROLE_TITLES = [
  'Unity Developer',
  'Gameplay Programmer',
  'Systems Programmer',
  'Mobile Optimizer',
];

export interface TelemetryNode {
  id: string;
  label: string;
  code: string;
  readout: string;
  metric: string;
}

export const ENGINE_TELEMETRY_NODES: TelemetryNode[] = [
  {
    id: 'unity6',
    label: 'UNITY 6 LTS',
    code: 'ENG // 01',
    readout: 'معماری ماژولار، Component-Driven و ابزارهای اختصاصی ادیتور برای پروژه‌های 2D/3D',
    metric: '6000.3 LTS',
  },
  {
    id: 'csharp',
    label: 'C# / CORE SYSTEMS',
    code: 'SYS // 02',
    readout: 'سیستم‌های State و Event-Based، Inventory، Save/Load و چرخه کامل گیم‌پلی',
    metric: 'OOP · EVENTS',
  },
  {
    id: 'urp',
    label: 'URP · VHS ATMOSPHERE',
    code: 'GFX // 03',
    readout: 'نورپردازی ریل‌تایم، پست‌پراسس VHS، مه حجمی و اتمسفر سنگین بازی‌های ترسناک',
    metric: '60 FPS LOCK',
  },
  {
    id: 'audio',
    label: 'SPATIAL AUDIO',
    code: 'SFX // 04',
    readout: 'صدای محیطی سه‌بعدی، Footstep وابسته به سطح و افکت‌های تعاملی گیم‌پلی',
    metric: '3D REVERB',
  },
  {
    id: 'mobile',
    label: 'ANDROID · MOBILE OPT',
    code: 'OPT // 05',
    readout: 'پروفایلینگ CPU/GPU، کاهش Draw Call و اجرای روان پروژه‌های 3D روی گوشی‌های ضعیف‌تر',
    metric: 'LOW-END READY',
  },
];

export interface HeroShowcaseItem {
  src: string;
  alt: string;
  layer: 'back' | 'front';
  badge?: string;
  style: Record<string, string | number>;
}

export const HERO_COLLAGE: HeroShowcaseItem[] = [
  // Atmospheric Depth-of-Field (Blurred Back Layer)
  {
    src: '/assets/aistudio/REWIND-80__6__072eafc7.png',
    alt: 'REWIND-80 — راهرو و نور اضطراری',
    layer: 'back',
    style: {
      ['--d' as string]: 0.5,
      ['--r0' as string]: '-7deg',
      ['--r2' as string]: '-4deg',
      top: '-4%',
      left: '-3%',
      width: '62%',
    },
  },
  {
    src: '/assets/projects/br3.jpg',
    alt: 'BACKROOMS — تعقیب و گریز محیطی',
    layer: 'back',
    style: {
      ['--d' as string]: 0.7,
      ['--r0' as string]: '7deg',
      ['--r2' as string]: '4deg',
      top: '22%',
      right: '-3%',
      width: '58%',
    },
  },
  {
    src: '/assets/projects/sg4.jpg',
    alt: 'SKY GATE — کابین و آسمان شب',
    layer: 'back',
    style: {
      ['--d' as string]: 0.6,
      ['--r0' as string]: '-4deg',
      ['--r2' as string]: '-1deg',
      bottom: '-5%',
      left: '14%',
      width: '62%',
    },
  },
  // Crisp AAA Foreground Showcase Planes
  {
    src: '/assets/aistudio/REWIND-80__2__ef07fa3c.png',
    alt: 'REWIND-80 — تونل و اتمسفر VHS',
    layer: 'front',
    badge: 'REWIND-80 · VHS HORROR',
    style: {
      ['--d' as string]: 1.4,
      ['--r0' as string]: '-1.5deg',
      ['--r2' as string]: '1deg',
      top: '6%',
      right: '3%',
      width: '82%',
    },
  },
  {
    src: '/assets/projects/sg1.jpg',
    alt: 'SKY GATE — پایگاه هوایی و برج مراقبت',
    layer: 'front',
    badge: 'SKY GATE · FLIGHT SIM',
    style: {
      ['--d' as string]: 2.1,
      ['--r0' as string]: '2.5deg',
      ['--r2' as string]: '-1.5deg',
      bottom: '8%',
      left: '0%',
      width: '57%',
    },
  },
  {
    src: '/assets/aistudio/REWIND-80__1__79f9639a.png',
    alt: 'REWIND-80 — اتاق CRT و دیباگ نورپردازی',
    layer: 'front',
    badge: 'UNITY 6 · LIGHTING',
    style: {
      ['--d' as string]: 2.6,
      ['--r0' as string]: '-2deg',
      ['--r2' as string]: '1.8deg',
      bottom: '0%',
      right: '2%',
      width: '52%',
    },
  },
];

export const STATS_COUNTERS: StatCounter[] = [
  { n: 3, label: 'سال تجربه' },
  { n: 5, label: 'پروژه مستقل' },
  { n: 15, label: 'سیستم گیم‌پلی' },
];

export const PROFILE_INFO_ROWS: InfoRow[] = [
  { label: 'سن', value: '۲۱ سال' },
  { label: 'شهر', value: 'بندرعباس' },
  { label: 'سابقه', value: '۳ سال' },
  { label: 'تمرکز فعلی', value: 'REWIND-80', ltr: true },
  { label: 'وضعیت خدمت', value: 'در حال انجام' },
  { label: 'پلتفرم', value: 'PC · Android', ltr: true },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'برنامه‌نویسی و توسعه',
    chips: [
      'Unity / C#',
      'OOP',
      'Core Systems',
      'Modular Systems',
      'State & Event-Based',
      'Debugging',
      'Prototyping',
      'Save / Load',
    ],
  },
  {
    title: 'سیستم‌های بازی',
    chips: [
      'Player Controller',
      'Movement & Dodge',
      'Stamina & Sprint',
      'Health & Damage',
      'Death System',
      'Combat & Shooting',
      'Interaction',
      'Dialogue & Story',
      'Inventory',
      'Enemy AI',
      'Survival',
      'Checkpoint',
      'Footstep Audio',
      'Cloth & Hair Physics',
      'Environmental Events',
    ],
  },
  {
    title: 'بهینه‌سازی و موبایل',
    chips: [
      'Unity Optimization',
      'CPU / GPU',
      'Performance Optimization',
      'Android Build',
      'گوشی‌های ضعیف‌تر',
      'کاهش پردازش غیرضروری',
      'بهینه‌سازی 3D موبایل',
    ],
  },
  {
    title: 'سایر',
    chips: [
      'Unity UI',
      'Audio Systems',
      'URP',
      'Addressables',
      'Project Architecture',
      'Custom Editor Tools',
      '2D & 3D',
    ],
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'rewind-80',
    n: 'REWIND-80',
    t: 'Horror · Story-Driven · PC / Steam',
    d: 'پروژه فعلی من؛ یک بازی ترسناک داستان‌محور با ظاهر دوربین VHS. گیم‌پلی و داستان اصلی طراحی شده و توسعه مرحله‌به‌مرحله ادامه داره. تمرکز روی سیستم‌های تعاملی، روایت، اتمسفر، Audio و ساختار فنی قابل توسعه‌ست.',
    c: ['Gameplay', 'Interaction', 'Narrative', 'Audio', 'Atmosphere', 'Unity 6'],
    i: [
      '/assets/aistudio/REWIND-80__2__ef07fa3c.png',
      '/assets/projects/rw2.jpg',
      '/assets/aistudio/REWIND-80__6__072eafc7.png',
      '/assets/aistudio/REWIND-80__1__79f9639a.png',
      '/assets/aistudio/REWIND-80__4__56a89d29.png',
      '/assets/aistudio/REWIND-80__3__4a500630.png',
      '/assets/aistudio/REWIND-80__5__a0c7bb9c.png',
    ],
  },
  {
    id: 'sky-gate',
    n: 'SKY GATE',
    t: 'Flight Simulator · Management System',
    d: 'شبیه‌ساز پرواز با تمرکز روی جنگنده برای مجموعه ورزشی توسکا در بندرعباس. ثبت‌نام خلبان، آموزش، مأموریت‌ها و Leaderboard توش در نظر گرفته شده و پروژه همچنان در حال توسعه‌ست.',
    c: ['Pilot Registration', 'Training', 'Missions', 'Leaderboard', 'Hangar'],
    i: [
      '/assets/projects/sg1.jpg',
      '/assets/projects/sg2.jpg',
      '/assets/projects/sg3.jpg',
      '/assets/projects/sg4.jpg',
    ],
  },
  {
    id: 'backrooms',
    n: 'BACKROOMS',
    t: '3D Horror · Mobile Optimization',
    d: 'پروژه Horror با ساختار Backrooms و دو مرحله. تمرکز اصلی روی بهینه‌سازی شدید برای موبایل، رسیدن به کیفیت گرافیکی مناسب با Performance قابل قبول، Enemy Chase و تعاملات فیزیکی بود؛ از جمله Jump Scare با پرتاب صندلی مبتنی بر فیزیک.',
    c: ['Mobile Optimization', 'Enemy Chase', 'Physics', 'Jump Scare', 'Android'],
    i: [
      '/assets/projects/br1.jpg',
      '/assets/projects/br2.jpg',
      '/assets/projects/br3.jpg',
      '/assets/projects/br4.jpg',
    ],
  },
  {
    id: 'jump-jump',
    n: 'JUMP JUMP',
    t: '2D Mobile Game',
    pt: true,
    d: 'اولین پروژه 2D من؛ بازی موبایلی مبتنی بر صعود، افزایش تدریجی سرعت و جمع‌آوری آیتم. تجربه عملی ساخت گیم‌پلی موبایل رو باهاش به دست آوردم.',
    c: ['Coin', 'Unlock', 'Map Progression', 'Magnet', 'Daily Reward'],
    i: [
      '/assets/projects/jj2.jpg',
      '/assets/projects/jj4.jpg',
      '/assets/projects/jj3.jpg',
      '/assets/projects/jj1.jpg',
      '/assets/projects/jj5.jpg',
    ],
  },
  {
    id: 'rpg-2p',
    n: 'RPG 2P',
    t: 'RPG · Multiplayer · 2-Player',
    phMain: '2P',
    phSub: 'CO-OP RPG',
    d: 'یک RPG دو نفره که مستقل توسعه دادم و با شروع خدمت متوقف شد. روی حرکت و Dodge، Footstep، Health و Damage، Death، Stamina، Sprint، Combat، Save/Load، منوی بازی، فیزیک لباس و مو و تعاملات بازیکن کار شده بود.',
    c: ['Combat', 'Dodge', 'Stamina', 'Save / Load', 'Cloth & Hair Physics'],
    i: [],
  },
];

export function formatTimecode(elapsedMs: number): string {
  const safeMs = Math.max(0, elapsedMs);
  const f = (num: number) => String(Math.floor(num)).padStart(2, '0');
  const minutes = Math.floor(safeMs / 60000);
  const seconds = Math.floor((safeMs / 1000) % 60);
  const frames = Math.floor(((safeMs % 1000) / 1000) * 30);
  return `${f(minutes)}:${f(seconds)}:${f(frames)}`;
}

export function getNextIndex(
  currentIndex: number,
  direction: 'next' | 'prev',
  total: number
): number {
  if (total <= 0) {
    return 0;
  }
  return direction === 'next'
    ? (currentIndex + 1) % total
    : (currentIndex - 1 + total) % total;
}

export function countTotalSkills(categories: SkillCategory[]): number {
  return categories.reduce((sum, category) => sum + category.chips.length, 0);
}

export function computeScrollProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const totalSpan = viewportHeight + rectHeight;
  if (!Number.isFinite(totalSpan) || totalSpan <= 0) {
    return 0;
  }
  const raw = (viewportHeight - rectTop) / totalSpan;
  if (!Number.isFinite(raw)) {
    return 0;
  }
  return Math.min(1, Math.max(0, raw));
}

export function buildResumeText(): string {
  return [
    `آرمین — Game Developer | Unity / C#`,
    `ایمیل: ${CONTACT_INFO.email}`,
    PROFILE_INFO_ROWS.map((row) => `${row.label}: ${row.value}`).join(' | '),
    '',
    'درباره من:',
    'توسعه‌دهنده مستقل بازی با حدود ۳ سال تجربه عملی در Unity و C#؛ از Core Systems، سیستم‌های بازیکن، تعاملات، Save/Load، Combat و Audio تا بهینه‌سازی Performance برای موبایل.',
    '',
    'مهارت‌ها:',
    ...SKILL_CATEGORIES.map((s) => `${s.title}: ${s.chips.join('، ')}`),
    '',
    'پروژه‌ها:',
    ...PROJECTS.map((p) => `- ${p.n} (${p.t}): ${p.d}`),
  ].join('\n');
}
