import {Component, OnInit, ViewChild, Renderer2} from '@angular/core';
import {Platform} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';

@Component({
    selector: 'app-drawPage',
    templateUrl: './drawPage.page.html',
    styleUrls: ['./drawPage.page.scss'],
})
export class drawPage implements OnInit {
    username: string;
    @ViewChild('draw') canvas: any;
    canvasElement: any;
    lastX: number;
    lastY: number;
    size: number = 5;
    maxPosition: number = 1;
    colour: string = '#000000';
    history: any = [100000];
    position: number = 0;

    constructor(private route: ActivatedRoute, private router: Router,
                private platform: Platform, private renderer: Renderer2) {
    }

    ngOnInit() {
        this.username = this.route.snapshot.paramMap.get('username');
        this.canvasElement = this.canvas.nativeElement;

        this.renderer.setAttribute(this.canvasElement, 'width', (this.platform.width() * 0.9) + "");
        this.renderer.setAttribute(this.canvasElement, 'height', (this.platform.height() * 0.75) + "");
        this.clearCanvas()
        let data = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        this.history[this.position] = data;
        this.position++;
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
        let data = this.canvasElement.getContext('2d').getImageData(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
        this.history[this.position] = data;
        this.position++;
        this.maxPosition = this.position;

    }

    clearCanvas() {
        this.canvasElement.getContext('2d').clearRect(0,
            0, this.canvasElement.getBoundingClientRect().width,
            this.canvasElement.getBoundingClientRect().height);
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
        if (this.position >= 1) {
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
}
