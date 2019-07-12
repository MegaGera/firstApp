import {Component, OnInit} from '@angular/core';
import {File} from '@ionic-native/file/ngx';
import {WebView} from '@ionic-native/ionic-webview/ngx';
import {Events, ToastController} from '@ionic/angular';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.page.html',
    styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {
    pictures = [];  //Array of saved pictures

    //Options for the slider
    sliderOptions = {
        spaceBetween: 20,
        centeredSlides: true
    };

    constructor(private file: File, private webView: WebView,
                private events: Events, private toastController: ToastController) {
    }

    /*
        Method that executes at the creation of this page
     */
    ngOnInit() {
        this.getPictures();
    }

    /*
        Method that gets the saved pictures by the application and save in "this.pictures" array
     */
    getPictures() {
        this.pictures = [];
        this.file.listDir(this.file.externalRootDirectory + "/Pictures", "DeveloperTest")
            .then((list) => {
                for(let i = 0; i < list.length; i++){
                    this.pictures[i] = { name: list[i].name, path: this.webView.convertFileSrc(list[i].toURL()) };
                }
            });
    }

    /*
        Method that sends to DrawPage the image to set on the canvas
     */
    setOnCanvas(name){
        this.events.publish('Set on canvas', name);
    }

    /*
        Method that removes and image of the gallery (and of the device too)
     */
    remove(name){
        this.file.removeFile(this.file.externalRootDirectory + "/Pictures/DeveloperTest", name).then(
            () =>{
            this.setToast("Image removed");
            this.getPictures();
        });
    }

    /*
        Method that shows a toast for an advice of an action.
     */
    setToast(message: string) {
        //Toast creation and options
        let toast = this.toastController.create({
            message: message,
            duration: 1000,
            position: 'bottom',
            animated: true
        });

        //Show the toast
        toast.then((toastData) => {
            toastData.present();
        });
    }
}
