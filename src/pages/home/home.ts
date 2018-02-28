import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, Platform } from 'ionic-angular';
import { RoomPage } from '../room/room';
import * as firebase from 'Firebase';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Media, File]
})
export class HomePage {

  @ViewChild(Content) content: Content;

  data = { type:'', nickname:'', message:'' };
  chats = [];
  roomkey:string;
  nickname:string;
  offStatus:boolean = false;
  fileName: any;
  filePath: any;
  audio: any;
  recordState: boolean;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private media: Media,
              private file: File,
              private platform: Platform) {
    this.roomkey = this.navParams.get("key") as string;
    this.nickname = this.navParams.get("nickname") as string;
    this.data.type = 'message';
    this.data.nickname = this.nickname;

    let joinData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    joinData.set({
      type:'join',
      user:this.nickname,
      message:this.nickname+' has joined this room.',
      sendDate:Date()
    });
    this.data.message = '';

    firebase.database().ref('chatrooms/'+this.roomkey+'/chats').on('value', resp => {
      this.chats = [];
      this.chats = snapshotToArray(resp);
      setTimeout(() => {
        if(this.offStatus === false) {
          this.content.scrollToBottom(300);
        }
      }, 1000);
    });
  }

  sendMessage() {
    let newData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    newData.set({
      type:this.data.type,
      user:this.data.nickname,
      message:this.data.message,
      sendDate:Date()
    });
    this.data.message = '';
  }

  exitChat() {
    let exitData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    exitData.set({
      type:'exit',
      user:this.nickname,
      message:this.nickname+' has exited this room.',
      sendDate:Date()
    });

    this.offStatus = true;

    this.navCtrl.setRoot(RoomPage, {
      nickname:this.nickname
    });
  }

  startRecord(){
    console.log('start Speech...')
    if(this.platform.is('android')){
      this.fileName = 'record-'+new Date().getTime()+'.wav';
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '')+ this.fileName;
      this.audio = this.media.create(this.filePath);
    }
   
    this.audio.startRecord();
    this.recordState = true;
    console.log('audio start recording...');
  }
  stopRecord(){
    this.audio.stopRecord();
    this.recordState = false;
    console.log('audio stoped recording...');
    console.log('see audio file in: '+ this.filePath);

    let audioObject = {
      audioName: this.fileName,
      audioPathUpload: null,
      type:'voice',
      user:this.nickname,
      message:'',
      sendDate:Date()
    }
    this.uploadTostorage(audioObject).then(audioData => {
      alert('upload finished')
      alert(JSON.stringify(audioData))
      // when upload audio success then add data to firebase here
      this.addToDatabase(audioData).then(data => {
        alert('data added')
      })
    });

  }
  uploadTostorage(audioObject: any): Promise<any>{
    return new Promise((resolve, reject) => {
      this.startUpload(audioObject.audioName).then(downloadURL => {
       audioObject.audioPathUpload = downloadURL;
       resolve(audioObject);
      });
    });
    
  }
  startUpload(filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      this.file.readAsDataURL(this.file.externalDataDirectory, filename).then(file => {
        let voiceRef = storageRef.child('voices/'+ filename).putString(file, firebase.storage.StringFormat.DATA_URL);
        voiceRef.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
          console.log('uploading...')
        }, (error) => {
          console.log(JSON.stringify(error))
          reject(error)
        }, () => {
          console.log('uploaded success')
          let downloadURL = voiceRef.snapshot.downloadURL;
          resolve(downloadURL)
        })
      });
    });
  }
  addToDatabase(audioData): Promise<any> {
    return new Promise((resolve, reject) => {
      let newData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats');
      newData.push(audioData).then(data => {
        resolve(data);
      });
    });
  }
  playAudio(chat){
    let audio = new Audio(chat.audioPathUpload);
    audio.play();
    this.audio.setVolume(0.8);
  }

}

export const snapshotToArray = snapshot => {
    let returnArr = [];

    snapshot.forEach(childSnapshot => {
        let item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });

    return returnArr;
};
