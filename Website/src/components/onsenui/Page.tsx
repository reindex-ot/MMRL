import React from "react";
import "onsenui/esm/elements/ons-page";
import onsCustomElement from "@Util/onsCustomElement";
import { styled } from "@mui/material";
import { os } from "@Native/Os";
import { useTheme } from "@Hooks/useTheme";

export type RenderFunction = (ref: React.ForwardedRef<HTMLElement>, context: ActivityContext) => JSX.Element | null;

interface NativeUIColors {
  mount: string;
  unmount: string;
}

interface HTMLPage {
  contentStyle?: React.CSSProperties;
  backgroundStyle?: React.CSSProperties;
  modifier?: string;
  renderModal?: RenderFunction;
  renderToolbar?: RenderFunction;
  renderBottomToolbar?: RenderFunction;
  renderFixed?: RenderFunction;
  onInit?: Function;
  onShow?: Function;
  onHide?: Function;
  onInfiniteScroll?: Function;
  onDeviceBackButton?: Function;
  children?: React.ReactNode;
  statusbarColor?: string;
  setStatusBarColor?: string;
  setNavigationBarColor?: string;
}

const HTMLPage = onsCustomElement<HTMLElement, HTMLPage>("ons-page", {
  notAttributes: ["onInfiniteScroll", "onDeviceBackButton"],
})({});

const _Page = React.forwardRef<HTMLElement, HTMLPage>((props, ref) => {
  const { theme } = useTheme();
  const { context } = useActivity();
  const { renderToolbar, renderBottomToolbar, renderModal, renderFixed, contentStyle, children, ...rest } = props;

  return (
    <HTMLPage {...rest} ref={ref}>
      {renderToolbar && renderToolbar(ref, context)}
      <div className="page__background" style={props.backgroundStyle}></div>
      <div className="page__content" style={contentStyle}>
        {children}
      </div>
      <div className="page__extra" style={{ zIndex: 10001 }}>
        {renderModal && renderModal(ref, context)}
      </div>
      {renderFixed && renderFixed(ref, context)}
      {renderBottomToolbar && renderBottomToolbar(ref, context)}
    </HTMLPage>
  );
});

import useMediaQuery from "@mui/material/useMediaQuery";
import { ActivityContext, useActivity } from "@Hooks/useActivity";

interface ContentProps {
  /**
   * This property affects only small screens
   */
  zeroMargin?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

interface IntrinsicElements extends Omit<React.JSX.IntrinsicElements, "section"> {
  section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & ContentProps, HTMLElement>;
}

const Content = styled<keyof IntrinsicElements>("section")((props: ContentProps) => ({
  display: "flex",
  flexDirection: "column",
  margin: props.zeroMargin ? 0 : 8,
}));

const RelativeContent = styled(Content)((props: ContentProps) => {
  const matches = useMediaQuery("(max-width: 767px)");

  return {
    boxSizing: "border-box",
    minWidth: props.minWidth ? props.minWidth : 200,
    maxWidth: props.maxWidth ? props.maxWidth : 980,
    margin: "0 auto",
    ...(matches ? { padding: props.zeroMargin ? 0 : 8 } : { padding: 45 }),
  };
});

const Page = Object.assign(_Page, {
  Content: Content,
  /**
   * Used for large screen to prevent content stretching
   */
  RelativeContent: RelativeContent,
});

export { Page };