import FacebookPhotoSelector from './FacebookPhotoSelector.vue'

const FbAlbumExplorer = {
  install (Vue, options) {
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {return}
      js = d.createElement(s)
      js.id = id
      js.src = '//connect.facebook.net/en_US/sdk.js'
      fjs.parentNode.insertBefore(js, fjs)
    }(document, 'script', 'facebook-jssdk'))
    window.fbAsyncInit = () => {
      FB.init(options)
      FB.AppEvents.logPageView()
      Vue.FB = FB
    };
    Vue.FB = undefined
    Vue.component('vue-fb-album-explorer', FacebookPhotoSelector)
  }
}

export default FbAlbumExplorer
