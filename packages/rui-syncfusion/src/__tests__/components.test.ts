import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SfGridFilterBar } from "../components/SfGridFilterBar";
import { SfLoadingHost } from "../components/SfLoadingHost";

describe("skin components", () => {
  it("renders grid filter chips", () => {
    const html = renderToStaticMarkup(
      createElement(SfGridFilterBar, {
        fields: [{ fieldName: "name", label: "名称" }],
      }),
    );
    expect(html).toContain("名称");
    expect(html).toContain("mmda-grid-filter-bar");
  });

  it("renders loading host", () => {
    const html = renderToStaticMarkup(
      createElement(SfLoadingHost, { loading: true }),
    );
    expect(html).toContain("mmda-loading-host");
  });
});
