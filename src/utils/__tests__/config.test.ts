jest.mock(
  "obsidian",
  () => ({
    parseYaml: (source: string): unknown => {
      if (!source.trim()) return null;
      if (source.includes("@@invalid@@")) {
        throw new Error("bad indentation of a mapping entry");
      }
      return JSON.parse(source) as unknown;
    },
  }),
  { virtual: true }
);

import { DEFAULT_SETTINGS } from "../../constants";
import { DynamicTOCSettings, TableOptions } from "../../types";
import { mergeConfig, parseConfig, validateCodeblockConfig } from "../config";

const baseSettings: DynamicTOCSettings = {
  ...DEFAULT_SETTINGS,
  style: "number",
  min_depth: 1,
  max_depth: 4,
  title: "## Contents",
  varied_style: true,
};

describe("validateCodeblockConfig", () => {
  it("should accept a full set of valid options", () => {
    const { options, warnings } = validateCodeblockConfig({
      style: "inline",
      min_depth: 2,
      max_depth: 5,
      title: "## TOC",
      delimiter: "*",
      allow_inconsistent_headings: true,
      varied_style: false,
    });
    expect(warnings).toEqual([]);
    expect(options).toEqual({
      style: "inline",
      min_depth: 2,
      max_depth: 5,
      title: "## TOC",
      delimiter: "*",
      allow_inconsistent_headings: true,
      varied_style: false,
    });
  });

  it("should return no overrides for empty input", () => {
    expect(validateCodeblockConfig(null)).toEqual({
      options: {},
      warnings: [],
    });
    expect(validateCodeblockConfig(undefined)).toEqual({
      options: {},
      warnings: [],
    });
  });

  it("should reject non-mapping input with a warning", () => {
    for (const bad of ["just text", 42, ["a", "b"]]) {
      const { options, warnings } = validateCodeblockConfig(bad);
      expect(options).toEqual({});
      expect(warnings).toHaveLength(1);
    }
  });

  it("should drop an invalid style and warn", () => {
    const { options, warnings } = validateCodeblockConfig({ style: "fancy" });
    expect(options.style).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("style");
  });

  it("should drop out-of-range or non-integer depths and warn", () => {
    for (const bad of [0, 7, 2.5, "3", true]) {
      const { options, warnings } = validateCodeblockConfig({
        min_depth: bad,
      });
      expect(options.min_depth).toBeUndefined();
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("min_depth");
    }
  });

  it("should drop both depths when max_depth is lower than min_depth", () => {
    const { options, warnings } = validateCodeblockConfig({
      min_depth: 4,
      max_depth: 2,
    });
    expect(options.min_depth).toBeUndefined();
    expect(options.max_depth).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("max_depth");
  });

  it("should keep a single valid depth", () => {
    const { options, warnings } = validateCodeblockConfig({ max_depth: 3 });
    expect(options).toEqual({ max_depth: 3 });
    expect(warnings).toEqual([]);
  });

  it("should warn on unknown keys without failing", () => {
    const { options, warnings } = validateCodeblockConfig({ stlye: "bullet" });
    expect(options).toEqual({});
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('unknown option "stlye"');
  });

  it("should ignore explicit null values silently", () => {
    const { options, warnings } = validateCodeblockConfig({ title: null });
    expect(options).toEqual({});
    expect(warnings).toEqual([]);
  });
});

describe("mergeConfig", () => {
  it("should use global settings when the block sets nothing", () => {
    const result = mergeConfig({}, baseSettings);
    expect(result.style).toBe("number");
    expect(result.max_depth).toBe(4);
    expect(result.title).toBe("## Contents");
  });

  it("should let block values win over global settings", () => {
    const result = mergeConfig({ style: "bullet", max_depth: 6 }, baseSettings);
    expect(result.style).toBe("bullet");
    expect(result.max_depth).toBe(6);
    expect(result.min_depth).toBe(1);
  });

  it("should let falsy-but-defined block values win", () => {
    const result = mergeConfig({ varied_style: false, title: "" }, baseSettings);
    expect(result.varied_style).toBe(false);
    expect(result.title).toBe("");
  });

  it("should fall back to defaults for null-ish settings values", () => {
    const settings = {
      ...baseSettings,
      style: null,
    } as unknown as DynamicTOCSettings;
    const result = mergeConfig({}, settings);
    expect(result.style).toBe(DEFAULT_SETTINGS.style);
  });

  it("should reflect later global settings changes for keys the block does not set", () => {
    const block: Partial<TableOptions> = { max_depth: 2 };
    const before = mergeConfig(block, baseSettings);
    const after = mergeConfig(block, { ...baseSettings, style: "bullet" });
    expect(before.style).toBe("number");
    expect(after.style).toBe("bullet");
    expect(after.max_depth).toBe(2);
  });
});

describe("parseConfig", () => {
  it("should parse valid config", () => {
    const result = parseConfig('{"style": "inline", "min_depth": 2}');
    expect(result).toEqual({
      ok: true,
      options: { style: "inline", min_depth: 2 },
      warnings: [],
    });
  });

  it("should treat empty source as no overrides", () => {
    const result = parseConfig("");
    expect(result).toEqual({ ok: true, options: {}, warnings: [] });
  });

  it("should surface YAML errors instead of throwing", () => {
    const result = parseConfig("@@invalid@@");
    expect(result).toEqual({
      ok: false,
      error: "bad indentation of a mapping entry",
    });
  });

  it("should carry validation warnings through", () => {
    const result = parseConfig('{"style": "fancy"}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(1);
      expect(result.options).toEqual({});
    }
  });
});
