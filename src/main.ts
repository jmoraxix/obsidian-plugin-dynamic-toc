import { Editor, MarkdownPostProcessorContext, Plugin } from "obsidian";
import { parseConfig } from "./utils/config";
import { ALL_MATCHERS, DEFAULT_SETTINGS } from "./constants";
import { CodeBlockRenderer } from "./renderers/code-block-renderer";
import { DynamicTOCSettingsTab } from "./settings-tab";
import { DynamicTOCSettings, EXTERNAL_MARKDOWN_PREVIEW_STYLE } from "./types";
import { DynamicInjectionRenderer } from "./renderers/dynamic-injection-renderer";
import { InsertCommandModal } from "./insert-command.modal";

export default class DynamicTOCPlugin extends Plugin {
  settings: DynamicTOCSettings = { ...DEFAULT_SETTINGS };
  onload = async () => {
    await this.loadSettings();
    this.addSettingTab(new DynamicTOCSettingsTab(this.app, this));
    this.addCommand({
      // eslint-disable-next-line obsidianmd/commands/no-command-in-command-id -- historical id; renaming would break existing user hotkey bindings
      id: "dynamic-toc-insert-command",
      name: "Insert table of contents",
      editorCallback: (editor: Editor) => {
        const modal = new InsertCommandModal(this.app, this);
        modal.start((text: string) => {
          editor.setCursor(editor.getCursor().line, 0);
          editor.replaceSelection(text);
        });
      },
    });
    this.registerMarkdownCodeBlockProcessor(
      "toc",
      (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const result = parseConfig(source);
        if (result.ok) {
          for (const warning of result.warnings) {
            console.warn(`[dynamic-toc] ${ctx.sourcePath}: ${warning}`);
          }
        } else {
          console.warn(
            `[dynamic-toc] ${ctx.sourcePath}: invalid YAML config — ${result.error}`
          );
        }
        ctx.addChild(
          new CodeBlockRenderer(
            this.app,
            result,
            this.settings,
            ctx.sourcePath,
            el
          )
        );
      }
    );

    this.registerMarkdownPostProcessor(
      (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const matchers =
          this.settings.supportAllMatchers === true
            ? ALL_MATCHERS
            : [this.settings.externalStyle];
        for (const matcher of matchers) {
          if (!matcher || matcher === "None") continue;
          const match = DynamicInjectionRenderer.findMatch(
            el,
            EXTERNAL_MARKDOWN_PREVIEW_STYLE[matcher]
          );
          if (!match?.parentNode) continue;
          ctx.addChild(
            new DynamicInjectionRenderer(
              this.app,
              this.settings,
              ctx.sourcePath,
              el,
              match
            )
          );
        }
      }
    );
  };

  loadSettings = async () => {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<DynamicTOCSettings> | null
    );
  };

  saveSettings = async () => {
    await this.saveData(this.settings);
    this.app.metadataCache.trigger("dynamic-toc:settings", this.settings);
  };
}
