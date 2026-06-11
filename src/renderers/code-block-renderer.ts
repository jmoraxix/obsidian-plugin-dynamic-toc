import {
  App,
  MarkdownRenderChild,
  MarkdownRenderer,
  TAbstractFile,
  TFile,
} from "obsidian";
import { mergeConfig, ParseConfigResult } from "../utils/config";
import { extractHeadings } from "../utils/extract-headings";
import { DynamicTOCSettings } from "../types";
import { TABLE_CLASS_NAME } from "../constants";

export class CodeBlockRenderer extends MarkdownRenderChild {
  constructor(
    private app: App,
    private parseResult: ParseConfigResult,
    private settings: DynamicTOCSettings,
    private filePath: string,
    public container: HTMLElement
  ) {
    super(container);
  }
  onload() {
    void this.render();
    this.registerEvent(
      this.app.metadataCache.on(
        "dynamic-toc:settings",
        this.onSettingsChangeHandler
      )
    );
    this.registerEvent(
      this.app.workspace.on(
        "active-leaf-change",
        this.onActiveLeafChangeHandler
      )
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", this.onFileChangeHandler)
    );
    this.registerEvent(this.app.vault.on("rename", this.onFileRenameHandler));
  }

  // Live Preview can render the block before its note gains focus (upstream
  // #48), so refresh on focus — but only for this renderer's own file, never
  // rebinding to whatever pane became active (upstream #53/#72/#51).
  onActiveLeafChangeHandler = () => {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || activeFile.path !== this.filePath) return;
    void this.render();
  };

  onSettingsChangeHandler = (settings: DynamicTOCSettings) => {
    this.settings = settings;
    void this.render();
  };
  onFileChangeHandler = (file: TFile) => {
    if (file.deleted || file.path !== this.filePath) return;
    void this.render();
  };
  onFileRenameHandler = (file: TAbstractFile, oldPath: string) => {
    if (oldPath !== this.filePath) return;
    this.filePath = file.path;
    void this.render();
  };

  async render() {
    this.container.empty();
    this.container.classList.add(TABLE_CLASS_NAME);
    if (!this.parseResult.ok) {
      this.container.createDiv({
        cls: "dynamic-toc-error",
        text: `⚠️ TOC config error: ${this.parseResult.error}. Using defaults.`,
      });
    }
    const blockOptions = this.parseResult.ok ? this.parseResult.options : {};
    // Merge lazily on every render so later global settings changes apply to
    // every key the block does not explicitly set.
    const config = mergeConfig(blockOptions, this.settings);
    const headings = extractHeadings(
      this.app.metadataCache.getCache(this.filePath),
      config
    );
    await MarkdownRenderer.render(
      this.app,
      headings,
      this.container,
      this.filePath,
      this
    );
  }
}
