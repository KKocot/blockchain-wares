/**
 * Grupy slotow formularza wydarzenia — progressive enhancement.
 * Bez skryptu wszystkie sloty sa widoczne i zapisuja sie natywnym POST-em. Skrypt tylko
 * chowa nadmiarowe puste sloty, odslania "+"/"x" i pilnuje limitu; nigdy nie tworzy, nie
 * usuwa i nie przestawia wezlow, bo indeksy pol musza zostac takie, jak wyrenderowal serwer.
 * Ramke slotu, kolor licznika i etykiete przycisku "+" (renderowane raz przez SSR) skrypt
 * trzyma w synchronizacji po kazdej zmianie — inaczej po dodaniu/wyczyszczeniu slotu bez
 * przeladowania strony zostawalyby zamrozone w stanie sprzed edycji.
 */

import {
  SLOT_GROUP_BY_NAME,
  type SlotGroupName,
} from "../components/admin/event_form_groups";
import {
  CHIP_EMPTY_CLASS,
  CHIP_FILLED_CLASS,
  SLOT_EMPTY_CLASS,
  SLOT_FILLED_CLASS,
  TONE_TEXT_CLASS,
} from "../components/admin/styles";

/** Lustrzane odbicie koloru licznika przy zerze wypelnionych slotow — patrz `EventFieldSlots.tsx`. */
const COUNTER_IDLE_CLASS = "text-base-content/40";

const GROUP_SELECTOR = "[data-slot-group]";
const SLOT_SELECTOR = "[data-slot-index]";
const REMOVE_SELECTOR = "[data-slot-remove], [data-slot-clear]";
const CONTROL_SELECTOR = "input, select, textarea";
const INVALID_SELECTOR = '[aria-invalid="true"]';

type SlotControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function controls_of(slot: Element): SlotControl[] {
  return Array.from(slot.querySelectorAll<SlotControl>(CONTROL_SELECTOR));
}

function is_toggle(control: SlotControl): control is HTMLInputElement {
  return (
    control instanceof HTMLInputElement &&
    (control.type === "checkbox" || control.type === "radio")
  );
}

function has_value(slot: Element): boolean {
  return controls_of(slot).some((control) =>
    is_toggle(control) ? control.checked : control.value.trim() !== "",
  );
}

function has_error(slot: Element): boolean {
  return slot.querySelector(INVALID_SELECTOR) !== null;
}

/** Slot z bledem zostaje widoczny nawet pusty — inaczej komunikat znikalby razem z nim. */
function is_kept(slot: Element): boolean {
  return has_value(slot) || has_error(slot);
}

/**
 * Podmienia tokeny klasy pustego/wypelnionego stanu bez ruszania reszty `className`
 * (np. `SLOT_CLASS`/rozmiaru chipa, ktore skrypt nigdy nie zmienia).
 */
function apply_theme(
  el: Element,
  empty_class: string,
  filled_class: string,
  filled: boolean,
): void {
  const empty_tokens = empty_class.split(" ");
  const filled_tokens = filled_class.split(" ");
  const next = filled ? filled_tokens : empty_tokens;
  const stale = (filled ? empty_tokens : filled_tokens).filter(
    (token) => !next.includes(token),
  );

  el.classList.remove(...stale);
  el.classList.add(...next);
}

function clear_slot(slot: Element): void {
  for (const control of controls_of(slot)) {
    if (is_toggle(control)) {
      control.checked = false;
    } else {
      control.value = "";
    }

    // Select bez pustej opcji zostalby z selectedIndex -1, wypadl z wysylki i rozjechal pary.
    if (control instanceof HTMLSelectElement && control.selectedIndex < 0) {
      control.selectedIndex = 0;
    }

    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function focus_slot(slot: Element): void {
  controls_of(slot)[0]?.focus();
}

function find_add_button(group: HTMLElement, name: string): HTMLElement | null {
  const inside = group.querySelector<HTMLElement>("[data-slot-add]");
  if (inside !== null) return inside;
  if (name === "") return null;

  return document.querySelector<HTMLElement>(
    `[data-slot-add="${CSS.escape(name)}"]`,
  );
}

/**
 * Odtwarza dokladnie ten sam ksztalt DOM, ktory SSR renderuje dla przycisku "+" —
 * `<span aria-hidden>` z glifem plus tekst, albo goly tekst "Komplet — N z N" — zeby
 * etykieta nadazala za limitem po dodaniu/wyczyszczeniu slotu bez przeladowania strony.
 */
function set_add_label(
  add: HTMLElement,
  complete: boolean,
  noun: string,
  max: number,
): void {
  add.replaceChildren();
  if (complete) {
    add.append(`Komplet — ${max} z ${max}`);
    return;
  }

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "+";
  add.append(icon, ` Dodaj ${noun}`);
}

function setup_group(group: HTMLElement): void {
  const name = group.dataset.slotGroup ?? "";
  const slots = Array.from(
    group.querySelectorAll<HTMLElement>(SLOT_SELECTOR),
  ).filter((slot) => slot.closest(GROUP_SELECTOR) === group);

  if (slots.length === 0) return;

  const declared = Number.parseInt(group.dataset.slotMax ?? "", 10);
  const max =
    Number.isFinite(declared) && declared > 0 ? declared : slots.length;
  const add = find_add_button(group, name);
  const counter = group.querySelector<HTMLElement>("[data-slot-counter]");
  const live = group.querySelector<HTMLElement>(
    '[data-slot-live], [role="status"]',
  );
  const spec = SLOT_GROUP_BY_NAME.get(name as SlotGroupName) ?? null;
  const is_chip = name === "topics";
  const tone_class = spec === null ? null : TONE_TEXT_CLASS[spec.tone];

  function announce(message: string): void {
    if (live !== null) live.textContent = message;
  }

  function sync(): void {
    for (const slot of slots) {
      // Blad zostaje wizualnie do nastepnego zapisu — skrypt nie zgaduje, czy poprawka
      // w trakcie pisania juz go rozwiazala.
      if (has_error(slot)) continue;

      apply_theme(
        slot,
        is_chip ? CHIP_EMPTY_CLASS : SLOT_EMPTY_CLASS,
        is_chip ? CHIP_FILLED_CLASS : SLOT_FILLED_CLASS,
        has_value(slot),
      );
    }

    const filled = slots.filter(has_value).length;
    if (counter !== null) {
      counter.textContent = `${filled} z ${max}`;
      if (tone_class !== null) {
        counter.classList.toggle(tone_class, filled > 0);
        counter.classList.toggle(COUNTER_IDLE_CLASS, filled === 0);
      }
    }

    if (add === null) return;

    const spare = slots.some((slot) => slot.hidden);
    const complete = !spare;
    add.toggleAttribute("data-full", complete);
    if (spare) {
      add.removeAttribute("aria-disabled");
    } else {
      add.setAttribute("aria-disabled", "true");
    }

    if (spec !== null) set_add_label(add, complete, spec.noun, max);
  }

  const first_empty = slots.findIndex((slot) => !is_kept(slot));
  slots.forEach((slot, index) => {
    slot.hidden = !is_kept(slot) && index !== first_empty;

    const remove = slot.querySelector<HTMLElement>(REMOVE_SELECTOR);
    if (remove !== null) remove.hidden = false;
  });

  if (add !== null) {
    add.hidden = false;
    add.addEventListener("click", (event) => {
      event.preventDefault();
      const next = slots.find((slot) => slot.hidden);
      if (next === undefined) {
        announce(
          `Osiągnięto limit ${max} pozycji. Wyczyść jedną, żeby dodać nową.`,
        );
        return;
      }

      next.hidden = false;
      sync();
      focus_slot(next);
      announce(`Dodano pozycję ${slots.indexOf(next) + 1} z ${max}.`);
    });
  }

  group.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const trigger = target.closest(REMOVE_SELECTOR);
    if (trigger === null) return;

    const slot = trigger.closest<HTMLElement>(SLOT_SELECTOR);
    if (slot === null || !slots.includes(slot)) return;

    event.preventDefault();
    clear_slot(slot);

    const index = slots.indexOf(slot);
    const spare = slots.some(
      (other, other_index) =>
        other_index !== index && !other.hidden && !has_value(other),
    );

    if (spare) {
      slot.hidden = true;
      const before = slots.slice(0, index).filter((other) => !other.hidden);
      const after = slots.slice(index + 1).filter((other) => !other.hidden);
      const neighbour = before.at(-1) ?? after[0];
      if (neighbour === undefined) add?.focus();
      else focus_slot(neighbour);
    } else {
      focus_slot(slot);
    }

    sync();
    announce(`Wyczyszczono pozycję ${index + 1}.`);
  });

  group.addEventListener("input", sync);
  group.addEventListener("change", sync);
  sync();
}

function init(): void {
  for (const group of document.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
    setup_group(group);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
