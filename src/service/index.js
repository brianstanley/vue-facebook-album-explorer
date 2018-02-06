/* global FB */
export default class Facebook {
  login (settings) {
    return new Promise((resolve, reject) => {
      FB.login((response) => {
        if (response.status === 'connected') {
          return resolve({
            name: settings.name,
            userID: response.authResponse.userID,
            accessToken: response.authResponse.accessToken
          })
        }
        reject(response)
      }, {scope: settings.perms})
    })
  }

  isConnected () {
    return new Promise((resolve, reject) => {
      FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
          resolve({status: true})
        }
        reject(response)
      })
    })
  }

  getPages (userId = 'me') {
    return new Promise((resolve, reject) => {
      FB.api(`/${userId}/accounts`, (response) => {
        if (response && !response.error) {
          resolve(response)
        }
        reject(response)
      })
    })
  }

  getAlbums (userId = 'me') {
    return new Promise((resolve, reject) => {
      FB.api(`/${userId}/albums`, (response) => {
        if (response && !response.error) {
          resolve(response)
        }
        reject(response)
      })
    })
  }

  fetchAlbumPhotos (albumId) {
    return new Promise((resolve, reject) => {
      FB.api(`/${albumId}/photos?fields=id,picture,source,height,width,images&limit=500`, (response) => {
        if (response && !response.error) {
          resolve(response.data)
        }
        reject(response)
      })
    })
  }
}
