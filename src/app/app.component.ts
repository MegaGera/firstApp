import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private androidPermissions: AndroidPermissions
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.android.permission.WRITE_EXTERNAL_STORAGE).then(
          (result)=>{
            if(!result.hasPermission)
            {
              this.androidPermissions.requestPermissions(
                  this.androidPermissions.PERMISSION.android.permission.WRITE_EXTERNAL_STORAGE
              ).then(()=>{
                // this.rootPage = HomePage;
                window.location.reload();
              });

            }
          });

    });
  }
}
