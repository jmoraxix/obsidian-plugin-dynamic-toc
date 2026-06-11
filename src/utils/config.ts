import { parseYaml } from "obsidian";
import { DEFAULT_SETTINGS } from "../constants";
import { BulletStyle, DynamicTOCSettings, TableOptions } from "../types";

const VALID_STYLES: readonly BulletStyle[] = ["bullet", "number", "inline"];

export interface ValidatedCodeblockConfig {
  options: Partial<TableOptions>;
  warnings: string[];
}

export type ParseConfigResult =
  | { ok: true; options: Partial<TableOptions>; warnings: string[] }
  | { ok: false; error: string };

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  return JSON.stringify(value) ?? typeof value;
}

/**
 * Validate raw (already YAML-parsed) codeblock input. Invalid fields are
 * dropped with a warning so they fall back to the global settings instead
 * of producing a broken render.
 */
export function validateCodeblockConfig(
  raw: unknown
): ValidatedCodeblockConfig {
  const options: Partial<TableOptions> = {};
  const warnings: string[] = [];
  if (raw === null || raw === undefined) {
    return { options, warnings };
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    warnings.push(
      `config must be a YAML mapping of options, got ${
        Array.isArray(raw) ? "an array" : `"${formatValue(raw)}"`
      }`
    );
    return { options, warnings };
  }
  for (const [key, value] of Object.entries(raw) as [string, unknown][]) {
    if (value === null || value === undefined) continue;
    switch (key) {
      case "style":
        if (
          typeof value === "string" &&
          (VALID_STYLES as readonly string[]).includes(value)
        ) {
          options.style = value as BulletStyle;
        } else {
          warnings.push(
            `style must be one of: ${VALID_STYLES.join(
              ", "
            )}; got "${formatValue(value)}"`
          );
        }
        break;
      case "min_depth":
      case "max_depth":
        if (
          typeof value === "number" &&
          Number.isInteger(value) &&
          value >= 1 &&
          value <= 6
        ) {
          options[key] = value;
        } else {
          warnings.push(
            `${key} must be an integer between 1 and 6; got "${formatValue(value)}"`
          );
        }
        break;
      case "title":
      case "delimiter":
        if (typeof value === "string") {
          options[key] = value;
        } else {
          warnings.push(`${key} must be a string; got "${formatValue(value)}"`);
        }
        break;
      case "allow_inconsistent_headings":
      case "varied_style":
        if (typeof value === "boolean") {
          options[key] = value;
        } else {
          warnings.push(
            `${key} must be true or false; got "${formatValue(value)}"`
          );
        }
        break;
      default:
        warnings.push(`unknown option "${key}" ignored`);
    }
  }
  if (
    options.min_depth !== undefined &&
    options.max_depth !== undefined &&
    options.max_depth < options.min_depth
  ) {
    warnings.push(
      `max_depth (${options.max_depth}) is lower than min_depth (${options.min_depth}); both ignored`
    );
    delete options.min_depth;
    delete options.max_depth;
  }
  return { options, warnings };
}

/**
 * Resolve the effective config with the precedence:
 * block option > global setting > hardcoded default.
 */
export function mergeConfig(
  block: Partial<TableOptions>,
  settings: DynamicTOCSettings,
  defaults: DynamicTOCSettings = DEFAULT_SETTINGS
): TableOptions {
  return {
    ...defaults,
    ...definedEntries(settings),
    ...definedEntries(block),
  };
}

function definedEntries<T extends object>(source: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source) as [string, unknown][]) {
    if (value !== null && value !== undefined) {
      out[key] = value;
    }
  }
  return out as Partial<T>;
}

/**
 * Parse and validate raw codeblock YAML. Never throws: malformed YAML is
 * reported through the discriminated result so the renderer can surface it
 * inline instead of silently swallowing it.
 */
export function parseConfig(source: string): ParseConfigResult {
  try {
    const raw: unknown = parseYaml(source);
    const { options, warnings } = validateCodeblockConfig(raw);
    return { ok: true, options, warnings };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : formatValue(error),
    };
  }
}
