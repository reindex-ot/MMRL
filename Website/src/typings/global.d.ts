import Android from "./android";

export {};

declare global {
  type int = number;
  type Int = number;
  type Void = void;
  type Any = any;

  interface Function {
    readonly name: string;
  }

  interface Window {
    /**
     * Declare the custom window event `Android` for the WebView
     */
    readonly android: Android;
  }

  interface Document {
    /**
     * Declare the custom window event `Android` for the WebView
     */
    readonly android: Android;
  }

  /**
   * Declare the custom window event `Android` for the WebView
   */
  const android: Android;

  type HTMLAttributes<E, P = {}> = React.DetailedHTMLProps<React.HTMLAttributes<E> & P, E>;
  type AnchorHTMLAttributes<E, P = {}> = React.DetailedHTMLProps<React.AnchorHTMLAttributes<E> & P, E>;

  namespace JSX {
    interface IntrinsicElements {
      "module-container": HTMLAttributes<HTMLDivElement>;
      "lib-container": HTMLAttributes<HTMLDivElement>;
    }
  }
}
