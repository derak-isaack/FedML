// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';

// Check if we have a valid client ID
const isValidClientId = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('your-google-client-id-here');

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.gapi = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        resolve();
        return;
      }

      if (typeof window.google === 'undefined') {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        this.isInitialized = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  handleCredentialResponse(response) {
    // This will be handled by the component that calls signIn
    if (this.onSignInCallback) {
      this.onSignInCallback(response);
    }
  }

  async signIn() {
    return new Promise((resolve, reject) => {
      if (!isValidClientId) {
        reject(new Error('Please configure REACT_APP_GOOGLE_CLIENT_ID in your .env file'));
        return;
      }

      if (!this.isInitialized) {
        reject(new Error('Google Auth not initialized'));
        return;
      }

      this.onSignInCallback = (response) => {
        try {
          // Decode the JWT token to get user info
          const userInfo = this.parseJwt(response.credential);

          const googleUser = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            email_verified: userInfo.email_verified
          };

          resolve(googleUser);
        } catch (error) {
          reject(error);
        }
      };

      // Trigger the Google Sign-In prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if prompt is not displayed
          this.signInWithPopup().then(resolve).catch(reject);
        }
      });
    });
  }

  async signInWithPopup() {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized) {
        reject(new Error('Google Auth not initialized'));
        return;
      }

      // Use the popup method as fallback
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (response) => {
          try {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            // Get user info using the access token
            const userInfo = await this.getUserInfo(response.access_token);
            resolve(userInfo);
          } catch (error) {
            reject(error);
          }
        },
      });

      client.requestAccessToken();
    });
  }

  async getUserInfo(accessToken) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    return await response.json();
  }

  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  signOut() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }

    // Clear stored user data
    localStorage.removeItem('malcare_google_user');
    localStorage.removeItem('google_access_token');
  }

  getCurrentUser() {
    const storedUser = localStorage.getItem('malcare_google_user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  isSignedIn() {
    return this.getCurrentUser() !== null;
  }
}

// Create a singleton instance
const googleAuthService = new GoogleAuthService();

export default googleAuthService;