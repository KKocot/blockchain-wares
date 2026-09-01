import { useId, type ReactNode } from "react";
import {
  EXCLUSION_FLAGS,
  type ExclusionFlag,
  type LogQuery,
} from "../../lib/logs/types";
import { cn } from "../../lib/utils";
import { SwitchLink, type SwitchTone } from "./SwitchLink";
import { CARD_CLASS } from "./styles";

/** Klucze, ktore ten blok przelacza — nazwa pola `LogQuery` jest zarazem nazwa parametru URL. */
export type TrafficFlag = ExclusionFlag | "includeInternal";

interface TrafficFiltersProps {
  query: LogQuery;
  /** Adres odwracajacy pojedyncza flage; budowany serwerowo, zawsze zeruje `page`. */
  flagHref: (flag: TrafficFlag) => string;
}

interface FlagCopy {
  label: string;
  description: string;
}

/**
 * Opisy sa czescia kontraktu z odbiorca panelu: programista ma widziec, co dokladnie
 * odcina dany przelacznik, bez zagladania do `user_agent.ts`.
 */
const EXCLUSION_COPY: Readonly<Record<ExclusionFlag, FlagCopy>> = {
  excludeCrawlers: {
    label: "Crawlery wyszukiwarek",
    description: "Googlebot, Bingbot, YandexBot, DuckDuckBot, Baiduspider",
  },
  excludeSeoTools: {
    label: "Narzędzia i podglądy",
    description: "AhrefsBot, SemrushBot, facebookexternalhit",
  },
  excludeScripts: {
    label: "Skrypty CLI/HTTP",
    description: "curl, wget, python-requests",
  },
  excludeHeadless: {
    label: "Headless",
    description:
      "UA zawiera „headless”: HeadlessChrome, HeadlessFirefox. Puppeteer łapie się tylko domyślnym UA, sam ciąg „Puppeteer” nie",
  },
  excludeUnknownUa: {
    label: "UA nierozpoznany",
    description: "Nagłówek User-Agent jest, ale nie pasuje do żadnej reguły",
  },
  excludeNoUa: {
    label: "Brak nagłówka UA",
    description: "Żądania bez User-Agent: surowe skanery, raw socket",
  },
};

const INTERNAL_COPY: FlagCopy = {
  label: "Loopback 127.0.0.1 / ::1",
  description: "Health-checki serwera, około 40% wszystkich wpisów",
};

type GroupId = "bots" | "unidentified";

/**
 * Przypisanie flag do grup jest mapa, a nie druga lista: `Record` wymusza uzupelnienie
 * przy dodaniu flagi, a kolejnosc renderu i tak bierze sie z `EXCLUSION_FLAGS`.
 */
const FLAG_GROUP: Readonly<Record<ExclusionFlag, GroupId>> = {
  excludeCrawlers: "bots",
  excludeSeoTools: "bots",
  excludeScripts: "bots",
  excludeHeadless: "bots",
  excludeUnknownUa: "unidentified",
  excludeNoUa: "unidentified",
};

function flags_of(group: GroupId): ExclusionFlag[] {
  return EXCLUSION_FLAGS.filter((flag) => FLAG_GROUP[flag] === group);
}

const BOT_FLAGS = flags_of("bots");
const UNIDENTIFIED_FLAGS = flags_of("unidentified");

const GROUP_TONE_TEXT: Readonly<Record<SwitchTone, string>> = {
  secondary: "text-secondary",
  warning: "text-warning",
  info: "text-info",
};

const GROUP_TONE_BAR: Readonly<Record<SwitchTone, string>> = {
  secondary: "bg-secondary",
  warning: "bg-warning",
  info: "bg-info",
};

function Group({
  title,
  hint,
  tone,
  children,
}: {
  title: string;
  hint: string;
  tone: SwitchTone;
  children: ReactNode;
}) {
  const heading_id = useId();

  return (
    <div role="group" aria-labelledby={heading_id} className="space-y-2">
      <h3
        id={heading_id}
        className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
      >
        <span
          className={cn(
            "flex items-center gap-2 text-xs font-semibold tracking-wide uppercase",
            GROUP_TONE_TEXT[tone],
          )}
        >
          <span
            aria-hidden="true"
            className={cn("h-3 w-0.5 rounded-full", GROUP_TONE_BAR[tone])}
          />
          {title}
        </span>
        <span className="text-xs font-normal text-base-content/50">{hint}</span>
      </h3>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function TrafficFilters({ query, flagHref }: TrafficFiltersProps) {
  const heading_id = useId();

  // Jedna polaryzacja na caly ekran: przelacznik wlaczony = ruch widoczny. Flagi
  // `exclude*` sa wiec renderowane odwrotnie do wartosci w adresie strony.
  const visible = (flag: ExclusionFlag): boolean => !query[flag];

  const exclusion_switch = (flag: ExclusionFlag, tone: SwitchTone) => (
    <SwitchLink
      key={flag}
      href={flagHref(flag)}
      checked={visible(flag)}
      label={EXCLUSION_COPY[flag].label}
      description={EXCLUSION_COPY[flag].description}
      tone={tone}
    />
  );

  return (
    <section aria-labelledby={heading_id} className={cn(CARD_CLASS, "space-y-4")}>
      <div>
        <h2 id={heading_id} className="text-sm font-semibold">
          Filtry ruchu
        </h2>
        <p className="mt-0.5 text-xs text-base-content/60">
          Przełącznik włączony = ta kategoria jest widoczna w kafelkach, wykresie
          i tabeli.
        </p>
      </div>

      <Group
        title="Boty rozpoznane"
        hint="UA pasuje do reguły ze słownika botów"
        tone="secondary"
      >
        {BOT_FLAGS.map((flag) => exclusion_switch(flag, "secondary"))}
      </Group>

      <Group
        title="Ruch niezidentyfikowany"
        hint="UA nie pasuje do żadnej reguły albo go nie ma"
        tone="warning"
      >
        {UNIDENTIFIED_FLAGS.map((flag) => exclusion_switch(flag, "warning"))}
      </Group>

      <Group
        title="Ruch wewnętrzny"
        hint="Żądania z tej samej maszyny"
        tone="info"
      >
        <SwitchLink
          href={flagHref("includeInternal")}
          checked={query.includeInternal}
          label={INTERNAL_COPY.label}
          description={INTERNAL_COPY.description}
          tone="info"
        />
      </Group>
    </section>
  );
}
