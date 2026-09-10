import { describe, expect, it } from "vitest";
import { carouselEj2Effect } from "../factory/carousel";

describe("carouselEj2Effect", () => {
  it("maps fade to EJ2 Fade", () => {
    expect(carouselEj2Effect("fade")).toBe("Fade");
    expect(carouselEj2Effect("slide")).toBe("Slide");
  });
});
