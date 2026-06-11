import { App, MarkdownRenderChild, MarkdownRenderer, TFile } from "obsidian";
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
  }

  onActiveLeafChangeHandler = () => {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) return;
    this.filePath = activeFile.path;
    this.onFileChangeHandler(activeFile);
  };

  onSettingsChangeHandler = (settings: DynamicTOCSettings) => {
    this.settings = settings;
    void this.render();
  };
  onFileChangeHandler = (file: TFile) => {
    this.filePath = file.path;
    if (file.deleted) return;
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
