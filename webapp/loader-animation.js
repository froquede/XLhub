import { LitElement, css, html, svg } from 'https://cdn.skypack.dev/lit';
let loader = svg`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; display: block;" width="111px" height="111px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<circle cx="50" cy="50" r="23" stroke="#0F0F11" stroke-width="11" fill="none"></circle>
<circle cx="50" cy="50" r="23" stroke="#fafafa" stroke-width="6" stroke-linecap="round" fill="none">
  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1.3333333333333333s" values="0 50 50;180 50 50;720 50 50" keyTimes="0;0.5;1"></animateTransform>
  <animate attributeName="stroke-dasharray" repeatCount="indefinite" dur="1.3333333333333333s" values="8.67079572390783 135.84246634122263;99.71415082494002 44.799111240190456;8.67079572390783 135.84246634122263" keyTimes="0;0.5;1"></animate>
</circle>
</svg>`;

export class LoaderAnimation extends LitElement {
  static properties = {
    data: {type: Object},
    type: {type: String}
  };

  static styles = css`
    :host {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100%;
    }

    :host svg {
      max-height: 100%;
    }
  `

  constructor() {
    super();
  }

  render() {
    return loader;
  }
}

customElements.define('loader-animation', LoaderAnimation);


