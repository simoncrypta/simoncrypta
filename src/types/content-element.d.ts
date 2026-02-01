import type { PropsWithChildren } from "@kitajs/html";

declare module "@kitajs/html" {
  namespace JSX {
    interface IntrinsicElements {
      content: PropsWithChildren<{}>;
    }
  }
}

export {};
