import { LitElement, css, html } from 'https://cdn.skypack.dev/lit';

export class mapCard extends LitElement {
  static properties = {
    data: {type: Object},
    type: {type: String}
  };
  
  static styles = css`
  :host {
    width: 320px;
    height: 188px;
    margin-right: 24px;
  }

  :host(.hidden) {
    display: none;
  }
  
  :host .image, :host .local-cover {
    width: 320px;
    height: 180px;
    object-fit: cover;
  }
  
  :host .image {
    filter: brightness(1.1);
  }

  :host p {
    font-family: 'Heebo', sans-serif;
  }
  
  :host .local-cover {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  :host .local-cover p {
    font-size: 38px;
    text-align: center;
    margin: 0;
    word-break: break-word;
    width: 100%;
    max-width: 100%;
    color: #fafafa;
    line-height: 0.75;
    padding-bottom: 46px;
  }
  
  :host .container {
    position: relative;
    border-radius: 42px;
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    width: 320px;
    height: 180px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    transform: scale(1);
  }
  
  :host .container:hover {
    transform: scale(1.04);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    transition-delay: .2s;
  }
  
  :host .title {
    margin: 0;
    box-sizing: border-box;
    padding: 4px 10px;
    position: absolute;
    bottom: 30px;
    left: 18px;
    font-size: 18px;
    max-width: calc(100% - 30px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fafafa;
    z-index: 10;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
  }
  
  :host .version {
    margin: 0px;
    position: absolute;
    bottom: 18px;
    left: 29px;
    font-size: 14px;
    max-width: calc(100% - 30px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgb(250, 250, 250);
    z-index: 10;
    font-family: Raleway, sans-serif;
    font-weight: 300;
  }
  
  :host .gradient-bg {
    position: absolute;
    width: 320px;
    height: 180px;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,.5) 50%, rgba(0,0,0,1) 100%);
    bottom: 0;
    z-index: 1;
  }
  
  :host .size {
    text-align: right;
    top: 16px;
    right: 16px;
    position: absolute;
    margin: 0px;
    color: rgb(250, 250, 250);
    font-family: Heebo, sans-serif;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 48px;
    box-sizing: border-box;
    padding: 2px 8px;
    font-size: 12px;
  }

  :host .stats {
    text-align: right;
    top: 16px;
    left: 16px;
    position: absolute;
    margin: 0px;
    color: rgb(250, 250, 250);
    font-family: Heebo, sans-serif;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 48px;
    box-sizing: border-box;
    padding: 2px 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host .stats img {
    width: 12px;
    height: 12px;
    padding-bottom: 1px;
    opacity: .75;
  }
  
  :host .button {
    border-radius: 50%;
    width: 42px;
    height: 42px;
    background: rgba(250, 250, 250, .5);
    margin: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: .2s ease all;
  }
  
  :host .button a {
    height: 18px;
  }
  
  :host .button img {
    transform: scale(1.5);
  }
  
  :host .button:hover, :host .text-button:hover, :host .button.active, :host .text-button.active {
    background: rgba(250, 250, 250, .75);
    transition: .2s ease all;
  }
  
  :host .button-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .85);
    opacity: 0;
    transition: .2s ease all;
    box-sizing: border-box;
    flex-direction: column;
    padding-top: 24px;
  }
  
  :host .button-container:hover, :host .button-container.active {
    opacity: 1;
    transition: .2s ease all;
    transition-delay: .2s;
  }

  :host .button-container.active, :host .button-container.local {
    padding-top: 0;
  }
  
  :host .download-percentage {
    color: #fafafa;
    font-size: 24px;
  }
  
  :host .state-container {
    display: flex;
    color: #fafafa;
    flex-direction: column;
  }
  
  :host .state-container p {
    margin: 0;
    text-align: center;
  }

  :host .description {
    color: #fafafa;
    font-family: Raleway, sans-serif;
    font-weight: 300;
    text-align: center;
    box-sizing: border-box;
    padding: 0 24px;
    text-overflow:ellipsis;
    overflow: hidden;
    -webkit-line-clamp: 3;
    white-space: normal;
    max-height: 58px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  :host .row {
    display: flex;
    min-width: 100%;
    max-width: 100%;
    align-items: center;
    justify-content: center;
  }

  :host .rating {
    display: flex;
    justify-content: flex-start;
    position: absolute;
    top: 16px;
    left: 16px;
    max-width: 100%;
  }

  :host loader-animation {
    width: 24px;
    height: 24px;
    min-height: 24px;
    max-height: 24px;
  }

  :host .rating .button {
    width: 24px;
    height: 24px;
    margin: 2px;
  }

  :host .rating .button img {
    width: 18px;
    height: 18px;
    transform: scale(1);
  }

  :host .subscribe {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    top: 16px;
    right: 16px;
    max-width: 100%;
  }

  :host .text-button {
    border-radius: 128px;
    background: rgba(250, 250, 250, .5);
    margin: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 22px;
    padding: 2px 8px;
    box-sizing: border-box;
    font-size: 12px;
    transition: .2s ease all;
  }

  :host .text-button p {
    margin: 0;
    color: #2F3640;
    font-size: 12px;
  }
  `;
  
  constructor() {
    super();
    this.percentage = 0;
    this.downloading = false; 
    this.extracting = false;
  }
  
  firstUpdated() {
    if(this.type != "local") {
      window.listen("download-percentage", this.onDownloadUpdate.bind(this));
      window.listen("extracting-download", this.onExtracting.bind(this));
      window.listen("extracting-finished", (message) => {
        if(message.id === this.data.id) {
          this.percentage = 0;
          this.downloading = false;
          this.extracting = false;
          this.requestUpdate();
        }
      });
    }
  }
  
  onDownloadUpdate(message) {
    if(message.id === this.data.id) {
      this.percentage = message.percentage;
      this.requestUpdate();
    }
  }
  
  onExtracting(message) {
    if(message.id === this.data.id) {
      this.percentage = message.percentage;
      this.extracting = true;
      this.requestUpdate();
    }
  }
  
  downloadFile(id) {
    fetch(`/modio/download`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id, token: localStorage.getItem("modio-token"), custom_path: localStorage.getItem("custom-path")})
    }).then(res => {
      console.dir(res);
      if(res.status == 200) {
        this.downloading = true;
        this.requestUpdate();
      }
      else {
        alert(res.status);
      }
    })
  }
  
  deleteFile(file) {
    if(!this.deleting && window.confirm(`Do you really want to delete ${file.name}?`)) {
      this.deleting = true;
      this.requestUpdate();
      fetch(`/local/map`, {
        method: "DELETE",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: file.file, token: localStorage.getItem("modio-token") })
      }).then(res => {
        console.dir(res);
        if(res.status == 200) {
          this.deleting = false;
          this.requestUpdate();
          window.getLocal();
        }
        else {
          alert(res.status);
        }
      });
    }
  }

  openFile(file) {
      this.requestUpdate();
      fetch(`/internal/open?file=${file.file}`).then(res => {
        console.dir(res);
      });
  }

  subscribe(del = false) {
    if(!this.subscribing) {
      this.subscribing = true;
      this.requestUpdate();
      fetch(`/modio/subscribe`, {
        method: del ? "DELETE" : "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: this.data.id, token: localStorage.getItem("modio-token")})
      }).then(res => {
        console.dir(res);
        if(res.status == 200) {
          window.user_subscriptions[this.data.id] = !del;
          this.subscribing = false;
          this.requestUpdate();
        }
        else {
          alert(res.status);
        }
      });
    }
  }

  like() {
    if(!this.liking) {
      this.liking = true;
      this.requestUpdate();
      fetch(`/modio/rating/positive`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: this.data.id, token: localStorage.getItem("modio-token")})
      }).then(res => {
        console.dir(res);
        if(res.status == 200) {
          window.user_ratings[this.data.id] = 1;
          this.liking = false;
          this.requestUpdate();
        }
        else {
          alert(res.status);
        }
      });
    }
  }

  dislike() {
    if(!this.liking) {
      this.liking = true;
      this.requestUpdate();
      fetch(`/modio/rating/negative`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: this.data.id, token: localStorage.getItem("modio-token")})
      }).then(res => {
        console.dir(res);
        if(res.status == 200) {
          window.user_ratings[this.data.id] = -1;
          this.liking = false;
          this.requestUpdate();
        }
        else {
          alert(res.status);
        }
      });
    }
  }

  removeLike() {
    if(!this.liking) {
      this.liking = true;
      this.requestUpdate();
      fetch(`/modio/rating/remove`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: this.data.id, token: localStorage.getItem("modio-token")})
      }).then(res => {
        console.dir(res);
        if(res.status == 200) {
          delete window.user_ratings[this.data.id];
          this.liking = false;
          this.requestUpdate();
        }
        else {
          alert(res.status);
        }
      });
    }
  }
  
  render() {
    if(this.data) {
      return html`
      <div class="container">
      <p class="title">${this.data.name}</p>
      ${
        (this.type == "local" && this.data.image) || this.type != "local" ? 
        html`<img class="image" loading="lazy" src="${this.type == "local" ? `/local/image?id=${encodeURIComponent(this.data.name)}` : this.data.logo.thumb_320x180}"/>` :
        html`<div class="local-cover"><p>${this.data.name}</p></div>`
      }
      
      ${ this.type != "local" ? html`
      <p class="version">
        ${this.data.submitted_by.username} ${this.data.modfile.version !== null && this.data.modfile.version.split('v').length == 1 ? " | v" : this.data.modfile.version ? " | " : ""}${this.data.modfile.version}
        ${html` | <time-ago datetime="${new Date(this.data.modfile.date_added * 1000).toString()}"></time-ago>`}
      </p>
      <!-- <p class="stats"><img src="bxs_upvote.svg"/>${this.data.stats.ratings_positive} <img src="bxs_downvote.svg"/> ${this.data.stats.ratings_negative}</p> -->
      <p class="size">${(this.data.modfile.filesize / 1024 / 1024).toFixed(0)}mb</p>
      
      <div class="button-container ${this.downloading ? "active" : ""}">
      ${!this.downloading ? html`
      <div class="row">
      <div title="Download ${this.data.name}" class="button download" @click=${() => {this.downloadFile(this.data.id)}}>
      <img src="download_icon.svg"/>
      </div>
      
      <div title="Open ${this.data.name} page on mod.io" class="button webpage">
        <a href="https://skaterxl.old.mod.io/${this.data.name_id}" target="_blank">
        <img src="webpage_icon.svg"/>
        </a>
      </div>
      </div>
      <div class="row">
        <p class="description" title="${this.data.summary}">${this.data.summary}</p>
      </div>
      <div class="rating">
        ${this.liking ? html`
          <loader-animation></loader-animation>
        ` :
        html`
          <div class="button ${window.user_ratings[this.data.id] == 1 ? "active" : ""}" title="Like ${this.data.name}" @click=${() => { window.user_ratings[this.data.id] == 1 ? this.removeLike() : this.like() }}><img src="like.svg"/></div>
          <div class="button ${window.user_ratings[this.data.id] == -1 ? "active" : ""}" title="Dislike ${this.data.name}" @click=${() => { window.user_ratings[this.data.id] == -1 ? this.removeLike() : this.dislike() }}><img src="dislike.svg"/></div>
        `
      }
      </div>
      <div class="subscribe">
        ${this.subscribing ? html`
            <loader-animation></loader-animation>
          ` :
          window.user_subscriptions[this.data.id] ? html`
            <div class="text-button active" @click=${() => {this.subscribe(true)}}><p title="Unsubscribe to ${this.data.name} on mod.io">unsubscribe</p></div>
          `
          : html`
            <div class="text-button" @click=${() => {this.subscribe()}}><p title="Subscribe to ${this.data.name} on mod.io">subscribe</p></div>
          `
        }        
      </div>
      ` : html`
      <div class="state-container">
      <p class="state">${this.downloading ? this.extracting ? "Extracting..." : "Downloading..." : ""}</p>
      <p class="download-percentage">${this.percentage.toFixed(0)}%</p>
      </div>
      `}
      </div>
      ` : html`
      <p class="size">${(this.data.size / 1024 / 1024).toFixed(0)}mb</p>
      <div class="button-container ${this.deleting ? "active" : ""} ${this.type}">
        <div class="row">
          <div title="Delete ${this.data.name}" class="button delete" @click=${() => {this.deleteFile(this.data)}}>
          <img src="delete_icon.svg"/>
          </div>
          <div title="Open ${this.data.name} folder" class="button open" @click=${() => {this.openFile(this.data)}}>
          <img src="folder_icon.svg"/>
          </div>
        </div>
      </div>
      `}
      <div class="gradient-bg"></div>    
      </div>
      `;
    }
  }
}

customElements.define('map-card', mapCard);