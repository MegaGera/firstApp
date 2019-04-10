import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drawPage',
  templateUrl: './drawPage.page.html',
  styleUrls: ['./drawPage.page.scss'],
})
export class drawPage implements OnInit{
  username: string;
  @ViewChild('draw') canvas: any;
  canvasElement: any;
  lastX: number;
  lastY: number;
  colour = '#000000';

  constructor(private route: ActivatedRoute, private router: Router,
              private platform: Platform, private renderer: Renderer2) { }

  ngOnInit(){
    this.username = this.route.snapshot.paramMap.get('username');
    this.canvasElement = this.canvas.nativeElement;

      this.renderer.setAttribute(this.canvasElement, 'width', this.platform.width() + "");
      this.renderer.setAttribute(this.canvasElement, 'height', (this.platform.height() * 0.65) + "");

  }

  changeColor(colour){
      this.colour = colour;
  }


  navHome(){
    this.router.navigate(['/home']);
  }

  start(ev){
    console.log(ev);

    let canvasPosition = this.canvasElement.getBoundingClientRect();
    this.lastX = ev.touches[0].pageX - canvasPosition.x;
    this.lastY = ev.touches[0].pageY - canvasPosition.y;
  }

  move(ev){
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
    ctx.lineWidth = 5;
    ctx.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  end(ev){
      console.log(ev);
  }
}
