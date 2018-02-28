import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase';
import { SigninPage } from '../pages/signin/signin';

var config = {
    apiKey: "AIzaSyA8VnABoyf4ID2CjTWjNycA3aa5pDKMuqM",
    authDomain: "ionic3-angular5-firebase.firebaseapp.com",
    databaseURL: "https://ionic3-angular5-firebase.firebaseio.com",
    projectId: "ionic3-angular5-firebase",
    storageBucket: "ionic3-angular5-firebase.appspot.com",
    messagingSenderId: "167085922111"
  };

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = SigninPage;


  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    firebase.initializeApp(config);
  }
}
