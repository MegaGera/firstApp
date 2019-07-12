import {Component, OnInit, Renderer2, ViewChild, DoCheck} from '@angular/core';
import {Platform, Events, ToastController } from '@ionic/angular';
import {File, IWriteOptions} from '@ionic-native/file/ngx';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-drawPage',
    templateUrl: './drawPage.page.html',
    styleUrls: ['./drawPage.page.scss'],
})
export class drawPage implements OnInit, DoCheck {
    username: string;               //The name that the user wrote on the Home page
    @ViewChild('draw') public canvas: any; //Reference to the canvas object of the HTML
    public canvasElement: any;             //Canvas element to interact
    lastX: number;                  //Global reference of the X coordinate to continue drawing
    lastY: number;                  //Global reference of the Y coordinate to continue drawing
    size: number = 5;               //Size of the line to draw
    colour: string = '#000000';     //Color of the line to draw
    public history: any = [100000];        //Array to have a history of the draws
    public position: number = 1;           //Actual position on the "history" array
    public maxPosition: number = 1;        //Max position on the "history" array
    prepare: number = 0;            //Variable to iterate a correct creation of the application
    image = new Image();            //Image variable to insert it on the canvas

    constructor(private route: ActivatedRoute, private router: Router,
                private platform: Platform, private renderer: Renderer2,
                private file: File, private camera: Camera, private events: Events,
                private toastController: ToastController) {

        /*
            Subscribe to the "Image loaded" event.
            This event draw a previously added image ("this.image" variable)
                on the canvas and add to the "history" array.
         */
        events.subscribe('Image loaded', () => {
            this.canvasElement.getContext('2d').drawImage(this.image, 0, 0);
            this.addToHistory();
        });

        /*
            Subscribe to the "Set on canvas" event.
            This event receive an image from the gallery page and charge it
                in the "this.image" variable.
         */
        events.subscribe('Set on canvas', (data) => {
            this.image.src = data;
        });
    }

    /*
        Method that executes at the creation of this page
     */
    ngOnInit() {
        this.username = this.route.snapshot.paramMap.get('username');   //Set the username
        this.canvasElement = this.canvas.nativeElement;                 //Set the canvas reference

        /*
            Function that is launched when and an image is charged in the "this.image" variable.
            This function send the event "Image loaded".
         */
        let event = this.events;       //Set a reference of the events for the next function
        this.image.onload = function () {
            event.publish('Image loaded');
        };
    }

    /*
        Method that checks the correct preparation of the canvas object.
        It is necessary doing it most than 1 time because the canvas is not correctly
            prepared at the start of this page.
     */
    ngDoCheck() {
        if (this.prepare <= 10){
            this.prepareCanvas();
            this.prepare++;
        }
    }

    /*
        Method that sets the attributes of the canvas.
     */
    prepareCanvas() {
        //Set the width of the canvas (90%)
        this.renderer.setAttribute(this.canvasElement, 'width', (this.platform.width() * 0.9) + "");
        //Set the height of the canvas (75%)
        this.renderer.setAttribute(this.canvasElement, 'height', (this.platform.height() * 0.75) + "");
        this.clearCanvas(0);    //Clear the canvas
        //Add the empty canvas to the first position of "history" array
        this.history[0] = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
    }

    /*
        Method to navigate to the home page.
    */
    navHome() {
        this.router.navigate(['/home']);
    }

    /*
        Method to navigate to the gallery page.
     */
    navGallery() {
        this.router.navigate(['/gallery']);
    }

    /*
        Method to start the draw.
     */
    start(ev) {
        let canvasPosition = this.canvasElement.getBoundingClientRect();
        this.lastX = ev.touches[0].pageX - canvasPosition.x;    //Get the X start touch
        this.lastY = ev.touches[0].pageY - canvasPosition.y;    //Get the Y start touch
    }

    /*
        Method to draw the movement.
     */
    move(ev) {
        let canvasPosition = this.canvasElement.getBoundingClientRect();
        let ctx = this.canvasElement.getContext('2d');  //Reference to draw
        let currentX = ev.touches[0].pageX - canvasPosition.x;   //Get the X position touch
        let currentY = ev.touches[0].pageY - canvasPosition.y;   //Get the Y position touch

        /*
            Draw a line between the last X and Y position to the current
         */
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(currentX, currentY);
        ctx.closePath();
        ctx.strokeStyle = this.colour;
        ctx.lineWidth = this.size;
        ctx.lineJoin = 'round';
        ctx.stroke();


        this.lastX = currentX;
        this.lastY = currentY;
    }

    /*
        Method to add a draw to "history" array.
     */
    end() {
        this.addToHistory();
    }

    /*
        Method that clears the canvas.
        It fills the background of the canvas with a white rectangle, it is necessary to correctly save the pictures..
     */
    clearCanvas(ready) {
        let ctx = this.canvasElement.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        if (ready != 0) {
            this.addToHistory()
        }
    }

    /*
        Method that changes the color of the line to draw.
     */
    changeColor(colour) {
        this.colour = colour;
    }

    /*
        Method that changes the thickness of the line to draw.
     */
    changeThickness(ev) {
        this.size = ev.target.value;
    }

    /*
        Method that increments by 1 the thickness of the line to draw.
     */
    plusThickness() {
        if (this.size < 20) {
            this.size++;
        }
    }

    /*
        Method that decrements by 1 the thickness of the line to draw.
     */
    lessThickness() {
        if (this.size > 1) {
            this.size--;
        }
    }

    /*
        Method that returns the username variable.
     */
    getUsername() {
        return this.username;
    }

    /*
        Method that set on canvas the previous position of the "history" array.
     */
    undo() {
        if (this.position > 1) {
            this.position--;
            let ctx = this.canvasElement.getContext('2d');
            ctx.putImageData(this.history[this.position - 1], 0, 0);
        }
    }

    /*
        Method that set on canvas the next position of the "history" array.
     */
    reUndo() {
        if (this.position < this.maxPosition) {
            this.position++;
            let ctx = this.canvasElement.getContext('2d');
            ctx.putImageData(this.history[this.position - 1], 0, 0);
        }
    }

    /*
        Method that adds on the "history" array the current context of the canvas.
        It prepares the array for the next position too.
     */
    public addToHistory() {
        this.history[this.position] = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        this.position++;
        this.maxPosition = this.position;
    }

    /*
        Method that save the current context of the canvas in the device.
     */
    save() {
        let ctx = this.canvasElement.getContext('2d');
        ctx.font = '48px arial'; //Set the font
        let previousColour = ctx.strokeStyle;   //Save the previous colour
        let previousLineWidth = ctx.lineWidth;  //Save the previous line width
        ctx.strokeStyle = '#FFFFFF';    //Set black colour for the text border
        ctx.lineWidth = 1;          //Set the new line width for the text border

        //Draw the text (username)
        ctx.fillText(this.username, 10, this.canvasElement.getBoundingClientRect().height * 0.9);
        ctx.strokeStyle = '#000000';    //Set black colour for the text border
        ctx.strokeText(this.username, 10, this.canvasElement.getBoundingClientRect().height * 0.9);
        ctx.strokeStyle = previousColour;   //Set the previous colour
        ctx.lineWidth = previousLineWidth;  //Set the previous line width

        //Transform the Base64 image in ArrayBuffer
        let dataUrl = this.canvasElement.toDataURL();
        let data = dataUrl.split(',')[1];
        let array = <ArrayBuffer>drawPage.base64ToArrayBuffer(data);

        //Let the parameteres
        let name = new Date().getTime() + '.jpeg';
        let path = this.file.externalRootDirectory + "/Pictures/DeveloperTest";
        let options: IWriteOptions = {replace: true};

        //Create the directory (if it is not created yet) and save the image
        this.file.createDir(this.file.externalRootDirectory + "/Pictures", "DeveloperTest",
            true).then(() => {
            this.file.writeFile(path, name, array, options).then(() =>{
                this.setToast("Image saved");
            });
        });

        //Back to the previous state to write the username
        ctx.putImageData(this.history[this.position - 1], 0, 0);

    }

    //Method which transform the Base64 image in ArrayBuffer
    static base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /*
        Method that takes and sets a picture from the camera or from the gallery in the canvas.
     */
    takePicture(sourceOption: number) {
        let source = this.camera.PictureSourceType.CAMERA; //Take picture from the camera
        if (sourceOption == 1) {
            source = this.camera.PictureSourceType.PHOTOLIBRARY; //Take picture from the gallery device
        }

        //Options to take the picture
        const options: CameraOptions = {
            quality: 100,
            sourceType: source,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            targetWidth: this.canvasElement.getBoundingClientRect().width,
            targetHeight: this.canvasElement.getBoundingClientRect().height,
            correctOrientation: true
        };

        //Take the picture
        this.camera.getPicture(options).then((imageData) => {
            this.image.src = 'data:image/jpeg;base64,' + imageData;
            this.setToast("Image loaded");
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
    