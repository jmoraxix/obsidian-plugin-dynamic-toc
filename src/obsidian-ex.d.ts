import type { EventRef } from "obsidian";
import { DynamicTOCSettings } from "./types";

declare module "obsidian" {
  interface TFile {
    // Undocumented runtime property; roadmap item: replace with vault delete events.
    deleted: boolean;
  }
  interface MetadataCache {
    // Custom plugin event fired via metadataCache.trigger() when settings save.
    on(
      name: "dynamic-toc:settings",
      callback: (settings: DynamicTOCSettings) => void,
      ctx?: unknown
    ): EventRef;
  }
}
