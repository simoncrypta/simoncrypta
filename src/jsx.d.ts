// `<content>` is a custom element styled in global.css; kitajs doesn't know it.
declare namespace JSX {
  interface IntrinsicElements {
    content: HtmlTag;
  }
}
