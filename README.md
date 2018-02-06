# vue-facebook-album-explorer
Plugin for Vue that allows you to explore and select a picture from an album

## Installation

```js
TODO: Publish to NPM
```
### Module

```js
import FbAlbumExplorer from 'FacebookAlbumExplorer';
Vue.use(FbAlbumExplorer, {appId: 'YOURAPPID', autoLogAppEvents: true, version: 'v2.9'})

```

## Usage

Once installed, it can be used in a template as simply as:

```html (example using PUG)
vue-fb-album-explorer(@pictureSelected="setPictureFromFb")
```
