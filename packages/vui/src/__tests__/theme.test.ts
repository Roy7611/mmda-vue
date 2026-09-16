import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { setupI18n } from "../i18n/i18n";
import { MmdaVueApp } from "../app/app";
import { createStubUiBuilder } from "../ui/builder";
import { TestUiBuilder } from "./test_builder";
import { ColorPalettePicker } from "../components/ColorPalettePicker";
import { FontScalePicker } from "../components/FontScalePicker";
import {
  DEFAULT_COLOR_PALETTE,
  DEFAULT_FONT_SCALE,
  MMDA_COLOR_PALETTES,
  MMDA_FONT_SCALES,
  readStoredColorPalette,
  readStoredFontScale,
  readStoredPageLayout,
  readStoredPageSize,
  readStoredShowActionsColumn,
  resolveColorPalette,
  resolveFontScale,
  writeStoredFontScale,
  writeStoredPageLayout,
  writeStoredPageSize,
  writeStoredShowActionsColumn,
} from "../app/theme";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.mmdaPalette;
  delete document.documentElement.dataset.mmdaFontScale;
  document.documentElement.style.removeProperty("--mmda-font-scale");
});

describe("MMDA color palettes", () => {
  it("provides ten Theme Studio palettes and falls back to purple", () => {
    expect(MMDA_COLOR_PALETTES.map((item) => item.id)).toEqual([
      "indigo",
      "purple",
      "blue",
      "violet",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "cyan",
    ]);
    expect(resolveColorPalette("blue")).toBe("blue");
    expect(resolveColorPalette("indigo")).toBe("indigo");
    expect(resolveColorPalette("cyan")).toBe("cyan");
    expect(resolveColorPalette("unknown")).toBe(DEFAULT_COLOR_PALETTE);
  });

  it("restores a valid stored palette and rejects an invalid value", () => {
    localStorage.setItem("mmda/colorPalette", "teal");
    expect(readStoredColorPalette()).toBe("teal");
    localStorage.setItem("mmda/colorPalette", "brand-x");
    expect(readStoredColorPalette()).toBe("purple");
  });

  it("persists pageSize preference under mmda/pageSize", () => {
    expect(readStoredPageSize()).toBe(20);
    writeStoredPageSize(50);
    expect(localStorage.getItem("mmda/pageSize")).toBe("50");
    expect(readStoredPageSize()).toBe(50);
    writeStoredPageSize(999);
    expect(readStoredPageSize()).toBe(50);
  });

  it("persists showActionsColumn preference under mmda/showActionsColumn", () => {
    expect(readStoredShowActionsColumn()).toBe(true);
    writeStoredShowActionsColumn(false);
    expect(localStorage.getItem("mmda/showActionsColumn")).toBe("false");
    expect(readStoredShowActionsColumn()).toBe(false);
    writeStoredShowActionsColumn(true);
    expect(readStoredShowActionsColumn()).toBe(true);
    localStorage.setItem("mmda/showActionsColumn", "nope");
    expect(readStoredShowActionsColumn()).toBe(true);
  });

  it("persists pageLayout preference under mmda/pageLayout", () => {
    expect(readStoredPageLayout()).toBe("cards");
    writeStoredPageLayout("tabs");
    expect(localStorage.getItem("mmda/pageLayout")).toBe("tabs");
    expect(readStoredPageLayout()).toBe("tabs");
    writeStoredPageLayout("cards");
    expect(readStoredPageLayout()).toBe("cards");
    localStorage.setItem("mmda/pageLayout", "nope");
    expect(readStoredPageLayout()).toBe("cards");
  });

  it("switches the document palette attribute", () => {
    const ui = new TestUiBuilder();
    ui.setColorPalette("green");
    expect(document.documentElement.dataset.mmdaPalette).toBe("green");
  });

  it("restores theme state before the application mounts", () => {
    localStorage.setItem("mmda/isDark", "true");
    localStorage.setItem("mmda/colorPalette", "orange");
    localStorage.setItem("mmda/fontScale", "large");
    const ui = createStubUiBuilder();
    const setColorScheme = vi.spyOn(ui, "setColorScheme");
    const setColorPalette = vi.spyOn(ui, "setColorPalette");
    const setFontScale = vi.spyOn(ui, "setFontScale");

    const app = new MmdaVueApp(
      "/api",
      "test",
      ui,
      setupI18n({}, "zh"),
    );

    expect(app.state.isDark).toBe(true);
    expect(app.state.colorPalette).toBe("orange");
    expect(app.state.fontScale).toBe("large");
    expect(setColorScheme).toHaveBeenCalledWith(true);
    expect(setColorPalette).toHaveBeenCalledWith("orange");
    expect(setFontScale).toHaveBeenCalledWith("large");
  });

  it("renders ten choices and persists the selected palette", async () => {
    const ui = createStubUiBuilder();
    ui.factory.resolveIcon = (icon: string) => icon;
    ui.factory.dropDownButton = (_props, actions) =>
      h(
        "div",
        actions.map((action) =>
          h(
            "button",
            {
              class: action.icon,
              "data-palette-action": action.name,
              onClick: action.onAction,
            },
            action.label,
          ),
        ),
      );
    const setColorPalette = vi.spyOn(ui, "setColorPalette");
    const mmda = new MmdaVueApp(
      "/api",
      "test",
      ui,
      setupI18n({}, "zh"),
    );
    const host = document.createElement("div");
    document.body.append(host);
    const root = defineComponent(() => () => h(ColorPalettePicker));
    const vueApp = createApp(root);
    vueApp.use(mmda);
    vueApp.mount(host);

    const choices = host.querySelectorAll("[data-palette-action]");
    expect(choices).toHaveLength(10);
    (host.querySelector(
      '[data-palette-action="color-palette-blue"]',
    ) as HTMLButtonElement).click();
    await Promise.resolve();

    expect(mmda.state.colorPalette).toBe("blue");
    expect(localStorage.getItem("mmda/colorPalette")).toBe("blue");
    expect(localStorage.getItem("colorPalette")).toBeNull();
    expect(setColorPalette).toHaveBeenLastCalledWith("blue");

    vueApp.unmount();
    host.remove();
  });
});

describe("MMDA font scale", () => {
  it("provides three scales and falls back to standard", () => {
    expect(MMDA_FONT_SCALES.map((item) => item.id)).toEqual([
      "standard",
      "large",
      "xlarge",
    ]);
    expect(resolveFontScale("large")).toBe("large");
    expect(resolveFontScale("xlarge")).toBe("xlarge");
    expect(resolveFontScale("unknown")).toBe(DEFAULT_FONT_SCALE);
  });

  it("persists fontScale preference under mmda/fontScale", () => {
    expect(readStoredFontScale()).toBe("standard");
    writeStoredFontScale("xlarge");
    expect(localStorage.getItem("mmda/fontScale")).toBe("xlarge");
    expect(readStoredFontScale()).toBe("xlarge");
    localStorage.setItem("mmda/fontScale", "tiny");
    expect(readStoredFontScale()).toBe("standard");
  });

  it("switches the document font-scale attribute and CSS variable", () => {
    const ui = new TestUiBuilder();
    ui.setFontScale("large");
    expect(document.documentElement.dataset.mmdaFontScale).toBe("large");
    expect(
      document.documentElement.style.getPropertyValue("--mmda-font-scale"),
    ).toBe("1.25");
    ui.setFontScale("unknown" as any);
    expect(document.documentElement.dataset.mmdaFontScale).toBe("standard");
    expect(
      document.documentElement.style.getPropertyValue("--mmda-font-scale"),
    ).toBe("1");
  });

  it("renders three choices and persists the selected scale", async () => {
    const ui = createStubUiBuilder();
    ui.factory.resolveIcon = (icon: string) => icon;
    ui.factory.dropDownButton = (_props, actions) =>
      h(
        "div",
        actions.map((action) =>
          h(
            "button",
            {
              class: action.icon,
              "data-font-scale-action": action.name,
              onClick: action.onAction,
            },
            action.label,
          ),
        ),
      );
    const setFontScale = vi.spyOn(ui, "setFontScale");
    const mmda = new MmdaVueApp("/api", "test", ui, setupI18n({}, "zh"));
    const host = document.createElement("div");
    document.body.append(host);
    const root = defineComponent(() => () => h(FontScalePicker));
    const vueApp = createApp(root);
    vueApp.use(mmda);
    vueApp.mount(host);

    const choices = host.querySelectorAll("[data-font-scale-action]");
    expect(choices).toHaveLength(3);
    (
      host.querySelector(
        '[data-font-scale-action="font-scale-xlarge"]',
      ) as HTMLButtonElement
    ).click();
    await Promise.resolve();

    expect(mmda.state.fontScale).toBe("xlarge");
    expect(localStorage.getItem("mmda/fontScale")).toBe("xlarge");
    expect(localStorage.getItem("fontScale")).toBeNull();
    expect(setFontScale).toHaveBeenLastCalledWith("xlarge");

    vueApp.unmount();
    host.remove();
  });
});
