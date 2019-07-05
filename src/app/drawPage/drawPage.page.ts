import {Component, OnInit, Renderer2, ViewChild, DoCheck} from '@angular/core';
import {Platform} from '@ionic/angular';
import {File, IWriteOptions} from '@ionic-native/file/ngx';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-drawPage',
    templateUrl: './drawPage.page.html',
    styleUrls: ['./drawPage.page.scss'],
})
export class drawPage implements OnInit, DoCheck{
    username: string;
    @ViewChild('draw') canvas: any;
    canvasElement: any;
    lastX: number;
    lastY: number;
    size: number = 5;
    maxPosition: number = 1;
    colour: string = '#000000';
    history: any = [100000];
    position: number = 1;
    prepare: number = 0;

    constructor(private route: ActivatedRoute, private router: Router,
                private platform: Platform, private renderer: Renderer2,
                private file: File, private camera: Camera) {
    }

    ngOnInit() {
        this.username = this.route.snapshot.paramMap.get('username');
        this.canvasElement = this.canvas.nativeElement;
    }

    ngDoCheck(){
        if(this.prepare <= 5) {
            this.prepareCanvas();
            this.prepare++;
        }
    }

    prepareCanvas(){
        this.renderer.setAttribute(this.canvasElement, 'width', (this.platform.width() * 0.9) + "");
        this.renderer.setAttribute(this.canvasElement, 'height', (this.platform.height() * 0.75) + "");
        this.clearCanvas();
        this.history[0] = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
    }

    changeColor(colour) {
        this.colour = colour;
    }


    navHome() {
        this.router.navigate(['/home']);
    }

    start(ev) {
        console.log(ev);

        let canvasPosition = this.canvasElement.getBoundingClientRect();
        this.lastX = ev.touches[0].pageX - canvasPosition.x;
        this.lastY = ev.touches[0].pageY - canvasPosition.y;
    }

    move(ev) {
        console.log(ev);

        let canvasPosition = this.canvasElement.getBoundingClientRect();
        let ctx = this.canvasElement.getContext('2d');
        let currentX = ev.touches[0].pageX - canvasPosition.x;
        let currentY = ev.touches[0].pageY - canvasPosition.y;

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

    end(ev) {
        console.log(ev);
        this.history[this.position] = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        this.position++;
        this.maxPosition = this.position;

    }

    clearCanvas() {
        let ctx = this.canvasElement.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        this.history[this.position] = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        this.position++;
        this.maxPosition = this.position;
    }

    changeThickness(ev) {
        this.size = ev.target.value;
    }

    plusThickness() {
        if (this.size < 20) {
            this.size++;
        }
    }

    lessThickness() {
        if (this.size > 1) {
            this.size--;
        }
    }

    getUsername() {
        return this.username;
    }

    undo() {
        if (this.position > 1) {
            this.position--;
            let ctx = this.canvasElement.getContext('2d');
            ctx.putImageData(this.history[this.position - 1], 0, 0);
        }
    }

    reUndo() {
        if(this.position < this.maxPosition) {
            this.position++;
            let ctx = this.canvasElement.getContext('2d');
            ctx.putImageData(this.history[this.position - 1], 0, 0);
        }
    }

    save(){
        let ctx = this.canvasElement.getContext('2d');
        ctx.font = '48px arial'; //Set the font
        let previousColour = ctx.strokeStyle;   //Save the previous colour
        let previousLineWidth = ctx.lineWidth;  //Save the previous line width
        ctx.strokeStyle = '#000000';    //Set black colour for the text border
        ctx.lineWidth = 1;          //Set the new line width for the text border

        //Draw the text (username)
        ctx.strokeText(this.username, 10, this.canvasElement.getBoundingClientRect().height * 0.9);
        ctx.strokeStyle = previousColour;   //Set the previous colour
        ctx.lineWidth = previousLineWidth;  //Set the previous line width

        //Transform the Base64 image in ArrayBuffer
        let dataUrl = this.canvasElement.toDataURL();
        let data = dataUrl.split(',')[1];
        let array = <ArrayBuffer> drawPage.base64ToArrayBuffer(data);

        //Let the parameteres
        let name = new Date().getTime() + '.jpeg';
        let path = this.file.externalRootDirectory + "/Pictures/DeveloperTest";
        let options: IWriteOptions = { replace: true };

        //Save the image
        this.file.writeFile(path, name, array, options).then(res => {
            console.log(this.file.dataDirectory);
        }, err => {
            console.log('error: ', err);
        });

        //Back to the previous state to write the username
        ctx.putImageData(this.history[this.position - 1], 0, 0);

    }

    //Method which transform the Base64 image in ArrayBuffer
    static base64ToArrayBuffer(base64){
        const binary_string =  window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    takePhoto() {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            targetWidth: this.canvasElement.getBoundingClientRect().width,
            targetHeight: this.canvasElement.getBoundingClientRect().height,
            correctOrientation: true
        }

        this.camera.getPicture(options).then((imageData) => {
            let ctx = this.canvasElement.getContext('2d');
            let image = new Image();
            image.onload = function() { ctx.drawImage(image, 0, 0) };
            image.src = 'data:image/jpeg;base64,' + imageData;
        }, (err) => {
            this.canvasElement.getContext('2d').strokeText("ERROR", 20, 20);
        });
        //this.canvasElement.getContext('2d').strokeText("ERROR2", 20, 20);
    }
}
