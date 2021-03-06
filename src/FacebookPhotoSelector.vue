<script>
  import Vue from 'vue'
  import Facebook from './service/'

  export default {
    name: 'FacebookPhotoSelector',
    props: {
      albumsPerPage: {
        type: Number,
        default: 6
      }
    },
    data () {
      return {
        isFBReady: false,
        authenticator: '',
        fb: '',
        albums: [],
        albumData: [],
        pageNumber: 0,
        totalPages: 0,
        photos: [],
        token: '',
        isAlbumSelected: false,
        loading: false,
        error: ''
      }
    },
    methods: {
      onFBReady () {
        this.isFBReady = true
      },
      fetchAlbums () {
        this.fb.getAlbums().then((albums) => {
          this.loading = false
          if (albums && albums.data.length) {
            this.albums = albums.data
            this.buildPaginator()
          }
        }).catch(() => {
          this.loading = false
          this.error = true
        })

      },
      buildPaginator () {
        let albumData = []
        let data = {}
        let count = 0
        let page = 0
        for (let album of this.albums) {
          if (typeof albumData[page] === 'undefined') {
            albumData[page] = []
          }
          if (count < this.albumsPerPage) {
            data = {
              id: album.id,
              name: album.name,
              url: `https://graph.facebook.com/${album.id}/picture?type=album&access_token=${this.token}`
            }
            albumData[page].push(data)
            count++
          } else {
            page++
            count = 0
          }
        }
        this.totalPages = albumData.length
        this.albumData = albumData
      },
      next () {
        if (this.pageNumber + 1 < this.totalPages) {
          this.pageNumber++
        }
      },
      previous () {
        if (this.pageNumber - 1 >= 0) {
          this.pageNumber--
        }
      },
      backToAlbum () {
        this.isAlbumSelected = false
      },
      onAlbumSelect (albumId) {
        this.loading = true
        this.fb.fetchAlbumPhotos(albumId).then(photos => {
          this.isAlbumSelected = true
          this.loading = false
          this.photos = photos
        }).catch(() => {
          this.error = 'error_unexpected'
        })
      },
      onPictureSelect (photo) {
        let src = photo.images[0].source
        this.$emit('pictureSelected', src)
      },
      onClose () {
        this.$emit('close')
      }
    }
    ,
    mounted () {
      this.isFBReady = Vue.FB != undefined
      window.addEventListener('fb-sdk-ready', this.onFBReady)
      if (this.isFBReady) {
        this.fb = new Facebook()
        this.fb.login({
          facebook: {perms: 'user_photos'}
        }).then(credential => {
          this.token = credential.accessToken
          this.fetchAlbums()
        }).catch(() => {
          this.loading = false
          this.$emit('close')
          this.error = 'error_unexpected'
        })
      }
    }
  }
</script>
<template lang="pug">
    #CSPhotoSelector
        .CSPhotoSelector_dialog
            .loading(v-if="loading")
                span.icon.icon-loading
            .CSPhotoSelector_form(v-if="loading === false")
                .CSPhotoSelector_header
                    a#CSPhotoSelector_buttonClose(@click="onClose") x
                    p Facebook Photo Album Explorer
                .CSPhotoSelector_content.CSAlbumSelector_wrapper
                    p Explore album
                    .CSPhotoSelector_searchContainer.CSPhotoSelector_clearfix
                        .CSPhotoSelector_selectedCountContainer Select an album
                    .CSPhotoSelector_photosContainer.CSAlbum_container(v-if="isAlbumSelected === false")
                        a(class="CSPhotoSelector_album CSPhotoSelector_photoSelected", @click="onAlbumSelect(album.id)", v-if="albums" v-for="album in albumData[pageNumber]")
                            .CSPhotoSelector_albumWrap
                                div
                                    img(class="CSPhotoSelector_photoAvatar", :alt="album.name", :src='album.url')
                            .CSPhotoSelector_photoName
                                | {{ album.name }}
                .CSPhotoSelector_content.CSPhotoSelector_wrapper(:class="{CSPhoto_container_active: isAlbumSelected}")
                    p  Select a new picture
                    .CSPhotoSelector_searchContainer.CSPhotoSelector_clearfix
                        a#CSPhotoSelector_backToAlbums(@click='backToAlbum') Back to the album
                    .CSPhotoSelector_photosContainer.CSPhoto_container(v-if="photos")
                        a(class="CSPhotoSelector_photo CSPhotoSelector_clearfix", v-for="photo in photos")
                            span
                                img(class="CSPhotoSelector_photoAvatar", @click="onPictureSelect(photo)", :src="photo.picture")
                #CSPhotoSelector_loader
                .CSPhotoSelector_footer.CSPhotoSelector_clearfix
                    a#CSPhotoSelector_pagePrev.CSPhotoSelector_disabled(@click="previous") Previous
                    a#CSPhotoSelector_pageNext(@click="next")  Next
                    .CSPhotoSelector_pageNumberContainer(v-if="isAlbumSelected === false")
                        | Page
                        span#CSPhotoSelector_pageNumber {{pageNumber + 1}}
                        | /
                        span#CSPhotoSelector_pageNumberTotal {{totalPages}}
                    a#CSPhotoSelector_buttonCancel(@click="onClose") Cancel
</template>
<style lang="css">
    #CSPhotoSelector {
        /*display: none;*/
        width: 100%;
        height: 100%;
        padding: 0;
        position: fixed;
        left: 0;
        top: 0;
        padding-top: 10%;
        z-index: 1000;
        color: #333;
        font-family: "lucida grande", tahoma, verdana, arial, sans-serif;
        font-size: 11px;
        background: rgba(0, 0, 0, .9);
    }

    #CSPhotoSelector,
    #CSPhotoSelector * {
        box-sizing: content-box;
        -moz-box-sizing: content-box;
        -webkit-box-sizing: content-box;
        line-height: normal;
    }

    #CSPhotoSelector a,
    #CSPhotoSelector a:active,
    #CSPhotoSelector a:hover,
    #CSPhotoSelector a:visited {
        text-decoration: none;
        color: #3B5998;
    }

    #CSPhotoSelector img {
        max-width: none;
    }

    #CSPhotoSelector p,
    #CSPhotoSelector ul,
    #CSPhotoSelector li {
        margin: 0;
        padding: 0;
    }

    #CSPhotoSelector li {
        list-style-type: none;
    }

    #CSPhotoSelector .CSPhotoSelector_clearfix:before,
    #CSPhotoSelector .CSPhotoSelector_clearfix:after {
        content: "";
        display: table;
    }

    #CSPhotoSelector .CSPhotoSelector_clearfix:after {
        clear: both;
    }

    #CSPhotoSelector .CSPhotoSelector_clearfix {
        zoom: 1;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog {
        width: 628px;
        padding: 10px;
        margin: 0 auto;
        position: relative;
        background: rgba(82, 82, 82, 0.7);
        overflow: hidden;
        -moz-border-radius: 8px;
        -webkit-border-radius: 8px;
        border-radius: 8px;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog #CSPhotoSelector_buttonClose {
        position: absolute;
        right: 18px;
        top: 15px;
        font-size: 16px;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog #CSPhotoSelector_buttonClose,
    #CSPhotoSelector .CSPhotoSelector_dialog #CSPhotoSelector_buttonClose:active,
    #CSPhotoSelector .CSPhotoSelector_dialog #CSPhotoSelector_buttonClose:hover,
    #CSPhotoSelector .CSPhotoSelector_dialog #CSPhotoSelector_buttonClose:visited {
        color: #fff;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_form {
        border: 1px solid #3B5998;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_header {
        padding: 7px 10px;
        background: #6D84B4;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_content {
        background: #fff;
        padding: 10px;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_searchContainer {
        margin-top: 10px;
        padding: 10px;
        background: #f1f1f1;
        border: solid #cacaca;
        border-width: 1px 0;
        font-weight: bold;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_searchContainer .CSPhotoSelector_selectedCountContainer {
        float: left;
        padding: 3px 0;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_searchContainer #CSPhotoSelector_backToAlbums {
        float: right;
        padding: 3px 0;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer {
        margin: 10px 0 0;
    }

    #CSPhotoSelector .CSPhotoSelector_content {
        height: 400px;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSAlbum_container .CSPhotoSelector_album {
        position: relative;
        display: inline-block;
        width: 185px;
        margin: 0 8px 14px;
        cursor: pointer;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSAlbum_container .CSPhotoSelector_albumWrap {
        position: relative;
        width: 175px;
        padding: 4px;
        border: 1px solid #ccc;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSAlbum_container .CSPhotoSelector_albumWrap div {
        height: 120px;
        overflow: hidden;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSAlbum_container .CSPhotoSelector_album .CSPhotoSelector_photoAvatar {
        display: block;
        max-width: 100%;
        border: none;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhoto_container .CSPhotoSelector_photo {
        position: relative;
        display: inline-block;
        border: 1px solid #ccc;
        background: #fff;
        padding: 4px;
        margin: 0 5px 3px;
        height: 96px;
        width: 127px;
        overflow: hidden;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhoto_container .CSPhotoSelector_photo:hover,
    #CSPhotoSelector .CSPhotoSelector_dialog .CSAlbum_container .CSPhotoSelector_albumWrap:hover,
    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhoto_container .CSPhotoSelector_photo.CSPhotoSelector_photoSelected {
        background: #f0f0f0;
        border-color: #3B5998;
        cursor: pointer;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhoto_container .CSPhotoSelector_photo span {
        position: relative;
        display: block;
        overflow: hidden;
        height: 100%;
        width: 100%;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhoto_container .CSPhotoSelector_photo .CSPhotoSelector_photoAvatar {
        position: relative;
        display: block;
        width: 120%;
        left: -10%;
        margin: 0 auto;
        border: none;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer .CSPhotoSelector_album .CSPhotoSelector_photoName {
        display: block;
        width: 100%;
        font-weight: bold;
        text-align: left;
        font-size: 12px;
        padding: 5px 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer .CSPhotoSelector_photo:hover .CSPhotoSelector_photoSelect {
        display: block;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer .CSPhotoSelector_photo.CSPhotoSelector_photoDisabled {
        cursor: default;
        opacity: .5;
        filter: alpha(opacity=50);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer .CSPhotoSelector_photo.CSPhotoSelector_photoDisabled:hover .CSPhotoSelector_photoSelect {
        display: none;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer .CSPhotoSelector_photo.CSPhotoSelector_photoFiltered {
        display: none;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer {
        padding: 8px 10px;
        background: #F2F2F2;
        border-top: 1px solid #CCC;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_pagePrev,
    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_pageNext {
        float: left;
        height: 21px;
        width: 22px;
        overflow: hidden;
        text-indent: -999em;
        /*background: transparent url(assets/pagination.png) no-repeat 0 0;*/
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_pagePrev {
        background-position: -44px 0;
        margin-right: 2px;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_pageNext {
        margin-right: 6px;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_pagePrev.CSPhotoSelector_disabled {
        background-position: -66px 0;
        cursor: default;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_pageNext.CSPhotoSelector_disabled {
        background-position: -22px 0;
        cursor: default;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer .CSPhotoSelector_pageNumberContainer {
        float: left;
        padding: 4px 0 0;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_buttonOK,
    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_buttonCancel {
        display: none;
        float: right;
        background: #3B5998;
        color: #fff;
        font-weight: bold;
        padding: 4px 20px 5px 20px;
        border: 1px solid;
        border-color: #D9DFEA #0E1F5B #0E1F5B #D9DFEA;
    }

    #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_footer #CSPhotoSelector_buttonCancel {
        display: block;
        border: 1px solid;
        border-color: #999 #999 #888 #999;
        background-color: #eee;
        color: #333;
        margin-right: 8px;
    }

    /* show/hide album and picture containers */
    #CSPhotoSelector_loader {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        /*background: url(assets/loader.gif) center center no-repeat rgba(255,255,255,0.5);*/
        -moz-border-radius: 8px;
        -webkit-border-radius: 8px;
        border-radius: 8px;
    }

    .CSPhotoSelector_wrapper {
        position: absolute;
        top: 43px;
        left: 670px;
        width: 606px;
        overflow: auto;

        -webkit-transition: left 0.3s ease-in-out;
        -moz-transition: left 0.3s ease-in-out;
        -o-transition: left 0.3s ease-in-out;
        transition: left 0.3s ease-in-out;
    }

    /* active photo container */
    .CSPhoto_container_active {
        left: 11px;
    }

    /* responsive support */
    /* optimized for iPhone 5 and upper
     * will produce a 1-column albums list
     * and a 2-columns photos list
     */
    @media screen and (max-width: 650px) {
        #CSPhotoSelector {
            padding: 0;
            margin: 0;
            position: absolute;
            align-items: center;
        }

        #CSPhotoSelector .CSPhotoSelector_dialog {
            display: block;
            align-items: center;
            width: 300px;
            margin: 0 auto;
            margin-top: 10%;
        }

        #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_photosContainer {
            height: 315px;
            overflow: scroll;
        }

        #CSPhotoSelector .CSPhotoSelector_dialog .CSAlbum_container .CSPhotoSelector_album {
            margin-left: auto;
            margin-right: auto;
            display: block;
        }

        #CSPhotoSelector .CSPhotoSelector_dialog .CSPhotoSelector_content.CSPhotoSelector_wrapper.CSPhoto_container_active {
            width: 278px;
            top: 42px;
        }

        #CSPhotoSelector .CSPhotoSelector_dialog .CSPhoto_container .CSPhotoSelector_photo {
            width: 117px;
            height: 86px;
        }
    }
</style>
