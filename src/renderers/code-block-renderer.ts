import { App, MarkdownRenderChild, MarkdownRenderer, TFile } from "obsidian";
import { mergeSettings } from "../utils/config";
import { extractHeadings } from "../utils/extract-headings";
import { DynamicTOCSettings, TableOptions } from "../types";
import { TABLE_CLASS_NAME } from "../constants";

export class CodeBlockRenderer extends MarkdownRenderChild {
  constructor(
    private app: App,
    private config: TableOptions,
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
    void this.render(mergeSettings(this.config, settings));
  };
  onFileChangeHandler = (file: TFile) => {
    this.filePath = file.path;
    if (file.deleted) return;
    void this.render();
  };

  async render(configOverride?: TableOptions) {
    this.container.empty();
    this.container.classList.add(TABLE_CLASS_NAME);
    const headings = extractHeadings(
      this.app.metadataCache.getCache(this.filePath),
      configOverride || this.config
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
