export type ComicPanelLayout = 
  | "single_splash" 
  | "split_horizontal" 
  | "split_vertical" 
  | "three_panel_hero" 
  | "four_panel_grid";

export interface ComicPanelSpec {
  panelId: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  borderWidthPx: number;
  borderColorHex: string;
  bgUrl: string;
  characterUrls?: string[];
  focusFrameStart: number;
  focusFrameEnd: number;
}

export class MotionComicDriver {
  /**
   * Generates standard panel geometry for vertical 9:16 or horizontal 16:9 comic layouts.
   */
  public generatePanelLayout(layout: ComicPanelLayout, aspectRatio: "9:16" | "16:9"): ComicPanelSpec[] {
    const isVertical = aspectRatio === "9:16";

    if (layout === "single_splash") {
      return [
        {
          panelId: "panel_1",
          xPercent: 4,
          yPercent: 12,
          widthPercent: 92,
          heightPercent: 76,
          borderWidthPx: 6,
          borderColorHex: "#111827",
          bgUrl: "",
          focusFrameStart: 0,
          focusFrameEnd: 90,
        },
      ];
    }

    if (layout === "split_vertical" || isVertical) {
      // 2 stacked panels in vertical 9:16
      return [
        {
          panelId: "panel_top",
          xPercent: 5,
          yPercent: 12,
          widthPercent: 90,
          heightPercent: 38,
          borderWidthPx: 5,
          borderColorHex: "#111827",
          bgUrl: "",
          focusFrameStart: 0,
          focusFrameEnd: 45,
        },
        {
          panelId: "panel_bottom",
          xPercent: 5,
          yPercent: 52,
          widthPercent: 90,
          heightPercent: 38,
          borderWidthPx: 5,
          borderColorHex: "#111827",
          bgUrl: "",
          focusFrameStart: 45,
          focusFrameEnd: 90,
        },
      ];
    }

    // Default 2-panel horizontal
    return [
      {
        panelId: "panel_left",
        xPercent: 4,
        yPercent: 8,
        widthPercent: 44,
        heightPercent: 84,
        borderWidthPx: 6,
        borderColorHex: "#111827",
        bgUrl: "",
        focusFrameStart: 0,
        focusFrameEnd: 45,
      },
      {
        panelId: "panel_right",
        xPercent: 52,
        yPercent: 8,
        widthPercent: 44,
        heightPercent: 84,
        borderWidthPx: 6,
        borderColorHex: "#111827",
        bgUrl: "",
        focusFrameStart: 45,
        focusFrameEnd: 90,
      },
    ];
  }
}

export const motionComicDriver = new MotionComicDriver();
