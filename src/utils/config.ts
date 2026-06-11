import { parseYaml } from "obsidian";
import { DynamicTOCSettings, TableOptions } from "../types";
/**
 * Merge settings and codeblock options taking truthy values
 * @param options - Code block options
 * @param settings - Plugin settings
 * @returns
 */
export function mergeSettings(
  options: TableOptions,
  settings: DynamicTOCSettings
): TableOptions {
  const merged = Object.assign({}, settings, options);
  const result = {} as TableOptions;
  for (const key of Object.keys(merged) as (keyof TableOptions)[]) {
    assignWithFallback(result, key, options, settings);
  }
  return result;
}

function assignWithFallback<K extends keyof TableOptions>(
  target: TableOptions,
  key: K,
  options: TableOptions,
  settings: DynamicTOCSettings
): void {
  const value = options[key];
  const isEmptyValue = typeof value === "undefined" || value === null;
  target[key] = isEmptyValue ? settings[key] : value;
}
/**
 * Parse the YAML source and merge it with plugin settings
 * @param source - Code block YAML source
 * @param settings - Plugin settings
 * @returns
 */
export function parseConfig(
  source: string,
  settings: DynamicTOCSettings
): TableOptions {
  try {
    const options = parseYaml(source) as TableOptions;
    return mergeSettings(options, settings);
  } catch {
    return settings;
  }
}
