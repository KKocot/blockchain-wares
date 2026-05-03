interface PythonIconProps {
  className?: string;
}

const SNAKE_PATH_1 = "M92,118 C110,110 114,94 92,90 C74,86 70,70 92,66";
const SNAKE_PATH_2 = "M108,118 C90,110 86,94 108,90 C126,86 130,70 108,66";

const GEAR_PATHS = [
  "M175.72740661031256,49.929447639179834L179.93426274441927,50.74565844078816L179.93426274441927,53.25434155921184L175.72740661031256,54.070552360820166L173.65685424949237,57.65685424949238L175.05342302750967,61.708203932499366L172.8808397169096,62.96254549171121L170.07055236082016,59.72740661031254L165.92944763917984,59.72740661031255L163.1191602830904,62.96254549171121L160.94657697249033,61.70820393249937L162.34314575050763,57.65685424949238L160.27259338968744,54.070552360820166L156.06573725558073,53.254341559211845L156.06573725558073,50.745658440788155L160.27259338968744,49.929447639179834L162.34314575050763,46.343145750507624L160.94657697249033,42.291796067500634L163.1191602830904,41.03745450828879L165.92944763917984,44.27259338968746L170.07055236082016,44.27259338968745L172.8808397169096,41.03745450828879L175.05342302750967,42.29179606750063L173.65685424949237,46.34314575050762Z",
  "M185.70633909777092,76.14589803375031L188.9290323118303,76.87200089792127L188.9290323118303,79.12799910207873L185.70633909777092,79.85410196624969L183.52671151375483,82.85410196624969L183.83201362408565,86.14344347219418L181.68643183127153,86.8405852565582L180,84L176.47328848624517,82.85410196624969L173.4392823532073,84.1609239533582L172.11323987960523,82.33578306691544L174.29366090222908,79.85410196624969L174.29366090222908,76.14589803375031L172.11323987960523,73.66421693308456L173.4392823532073,71.83907604664181L176.47328848624517,73.14589803375031L180,72L181.6864318312715,69.1594147434418L183.83201362408565,69.85655652780582L183.52671151375483,73.14589803375031Z",
  "M170.7614807840235,96.18826668428235L173.94521895368274,96.95471536732346L173.94521895368274,99.04528463267654L170.7614807840235,99.81173331571765L168.94974746830584,102.94974746830583L169.87785252292474,106.09016994374947L168.067366430758,107.13545457642601L165.81173331571765,104.76148078402348L162.18826668428235,104.76148078402348L159.932633569242,107.13545457642601L158.12214747707526,106.09016994374947L159.05025253169416,102.94974746830583L157.2385192159765,99.81173331571765L154.05478104631726,99.04528463267654L154.05478104631726,96.95471536732346L157.2385192159765,96.18826668428235L159.05025253169416,93.05025253169417L158.12214747707526,89.90983005625053L159.932633569242,88.864545423574L162.18826668428235,91.23851921597652L165.81173331571765,91.23851921597652L168.067366430758,88.86454542357399L169.8778525229247,89.90983005625051L168.94974746830582,93.05025253169416Z",
] as const;

const TERM_LINES = [
  { x: 26, y: 62, w: 36, o: 0.35 },
  { x: 22, y: 70, w: 28, o: 0.3 },
  { x: 26, y: 78, w: 32, o: 0.25 },
  { x: 22, y: 86, w: 24, o: 0.2 },
  { x: 26, y: 94, w: 30, o: 0.3 },
] as const;

const GEARS = [
  { cx: 168, cy: 52, ir: 8, t: 6 },
  { cx: 180, cy: 78, ir: 6, t: 5 },
  { cx: 164, cy: 98, ir: 7, t: 6 },
] as const;

const PROG = [
  { x: 42, w: 22, o: 0.5 },
  { x: 66, w: 18, o: 0.4 },
  { x: 86, w: 26, o: 0.35 },
  { x: 114, w: 14, o: 0.25 },
  { x: 130, w: 20, o: 0.15 },
] as const;

const SNAKES = [
  { path: SNAKE_PATH_1, cx: 92, cls: "python-snake-1" },
  { path: SNAKE_PATH_2, cx: 108, cls: "python-snake-2" },
] as const;

export function PythonIcon({ className }: PythonIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Terminal prompt */}
      <g className="python-terminal">
        <rect x="12" y="42" width="54" height="66" rx="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="42" width="54" height="12" rx="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="21" cy="48" r="2" fill="currentColor" fillOpacity="0.6" />
        <circle cx="29" cy="48" r="2" fill="currentColor" fillOpacity="0.4" />
        <circle cx="37" cy="48" r="2" fill="currentColor" fillOpacity="0.25" />
        <path d="M18 62 L23 65 L18 68" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
        <path d="M18 78 L23 81 L18 84" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" />
        {TERM_LINES.map((l, i) => (
          <line key={`t-${i}`} x1={l.x} y1={l.y} x2={l.x + l.w} y2={l.y} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={l.o} />
        ))}
      </g>

      {/* Python intertwined snakes */}
      <g className="python-snakes">
        {SNAKES.map((snake) => (
          <g key={snake.cls}>
            <path d={snake.path} stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className={snake.cls} />
            <path d={snake.path} stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" strokeOpacity="0.04" />
            <circle cx={snake.cx} cy="66" r="4" fill="currentColor" fillOpacity="0.7" />
            <circle cx={snake.cx} cy="66" r="7" fill="currentColor" fillOpacity="0.08" />
          </g>
        ))}
        <rect x="94" y="84" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" transform="rotate(45 100 90)" />
      </g>

      {/* Automation pipeline gears */}
      <g className="python-automation">
        {GEARS.map((g, i) => (
          <g key={`gear-${i}`} className={`python-gear-${i}`}>
            <path d={GEAR_PATHS[i]} fill="currentColor" fillOpacity={0.08 + i * 0.03} stroke="currentColor" strokeWidth="1.5" />
            <circle cx={g.cx} cy={g.cy} r={g.ir * 0.6} fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
            <circle cx={g.cx} cy={g.cy} r={g.ir * 0.25} fill="currentColor" fillOpacity="0.5" />
          </g>
        ))}
        <line x1="168" y1="62" x2="178" y2="70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.2" />
        <line x1="176" y1="86" x2="168" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.2" />
        <path d="M120 76 C132 72, 148 56, 156 54" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
        <path d="M120 90 C136 90, 148 92, 154 96" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
      </g>

      {/* Test runner / progress bar */}
      <g className="python-progress">
        <rect x="38" y="134" width="124" height="10" rx="5" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
        {PROG.map((s, i) => (
          <rect key={`p-${i}`} x={s.x} y="136" width={s.w} height="6" rx="3" fill="currentColor" fillOpacity={s.o} className={`python-progress-${i}`} />
        ))}
        {[48, 76, 100, 122, 142].map((x, i) => (
          <circle key={`d-${i}`} cx={x} cy="148" r="1.5" fill="currentColor" fillOpacity={0.5 - i * 0.08} />
        ))}
      </g>
    </svg>
  );
}
