import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// "State is never colour alone" (CLAUDE.md design system) as a check instead of a
// re-read: every CSS rule that styles a pressed/current/selected/active state must
// either declare a non-colour property itself, or be listed below with the place
// where the non-colour cue actually lives. A new colour-only state rule fails here.

const STYLESHEETS = ['src/index.css', 'src/components/session/session.css'];

const STATE_SELECTOR =
  /\[aria-(pressed|current|selected|checked|expanded)(=['"]?(true|step|location|page)['"]?)?\]|\.is-(active|current|selected|completed)\b|\.active\b|:checked|--active\b|--selected\b/;

const NON_COLOUR_PROPERTY =
  /^(border(-(top|right|bottom|left))?(-(width|style))?$|outline|box-shadow|text-decoration|font-weight|font-style|transform|content|background-image|width|height|padding|margin|inset|position|display|opacity|letter-spacing|text-transform)/;

// Selector fragment -> where the non-colour cue lives. Keep each reason checkable.
const CUE_ELSEWHERE: Record<string, string> = {
  '.screen-template--selected': 'native radio input stays visible inside the card',
  "body.dark-theme .arcana-header button.screen-mode__button[aria-pressed='true']":
    'colour override only; the light rule on the same element carries --as-state-mark',
  "[aria-expanded='true']": 'disclosure: the revealed content is the cue',
  '[aria-expanded="true"]': 'disclosure: the revealed content is the cue',
  '.widget-item__favorite.is-active': 'Star icon switches to weight="fill" in WidgetItem.tsx',
  '.capture-star[aria-pressed="true"]': 'Star icon switches to weight="fill" in RunWorkspace.tsx',
  '.recent-star[aria-pressed="true"]': 'Star icon switches to weight="fill" in QuickCaptureBar.tsx',
  '.read-aloud__edit[aria-pressed="true"]': 'button text switches Edit -> Done in ReadAloud.tsx',
  '.flow-moment.is-active': 'moment status is printed as text in RunWorkspace.tsx',
  '.pacing-step.is-current .pacing-step__num': 'sibling .pacing-step__label is underlined',
  '.combatant-card--active': 'turn-change animation; the base --active rule carries the cue',
};

interface StateRule {
  file: string;
  selector: string;
  properties: string[];
}

const stateRules = (): StateRule[] =>
  STYLESHEETS.flatMap((file) => {
    const css = readFileSync(resolve(process.cwd(), file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .map((match) => ({
        file,
        selector: match[1].trim().replace(/\s+/g, ' '),
        properties: match[2].split(';').map((declaration) => declaration.split(':')[0].trim()).filter(Boolean),
      }))
      .filter((rule) => !rule.selector.startsWith('@') && STATE_SELECTOR.test(rule.selector));
  });

describe('state cues', () => {
  it('finds the state rules it is meant to police', () => {
    expect(stateRules().length).toBeGreaterThan(20);
  });

  it('never signals a pressed/current/selected state with colour alone', () => {
    const colourOnly = stateRules()
      .filter((rule) => !rule.properties.some((property) => NON_COLOUR_PROPERTY.test(property)))
      .filter((rule) => !Object.keys(CUE_ELSEWHERE).some((fragment) => rule.selector.includes(fragment)))
      .map((rule) => `${rule.file}: ${rule.selector}`);
    expect(colourOnly).toEqual([]);
  });

  it('keeps every exemption pointing at a rule that still exists', () => {
    const selectors = stateRules().map((rule) => rule.selector);
    const stale = Object.keys(CUE_ELSEWHERE).filter((fragment) => !selectors.some((selector) => selector.includes(fragment)));
    expect(stale).toEqual([]);
  });
});
