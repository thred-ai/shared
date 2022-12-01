import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-butterfly',
  templateUrl: './butterfly.component.html',
  styleUrls: ['./butterfly.component.scss']
})
export class ButterflyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  tapedTwice = false; //
  @Input() movable = false


  clickedFly() {
    if (!this.tapedTwice) {
      this.tapedTwice = true;
      setTimeout(() => {
        this.tapedTwice = false;
      }, 300);
      return false;
    }
    // do something
    this.initFly();

    return true;
  }

  initFly(hideRing = true) {
    var fly = document.getElementById('flyRing');
    this.beginFlyAnimation(hideRing)


    setTimeout(() => {
      if (this.movable){
        let bottomBarHeight = (window.innerHeight / 10) * 2;

        fly!.style.left = window.innerWidth / 2 - 155 / 2 + 'px';
        fly!.style.top =
          document.body.scrollHeight - 75 - bottomBarHeight + 'px';
  
      }
      setTimeout(() => {
        this.endFlyAnimation()
      }, 1500);
    }, 0);
  }

  beginFlyAnimation(hideRing = true) {
    var fly = document.getElementById('flyRing');

    var fly2 = document.getElementById('fly');

    if (hideRing){
      fly!.classList.remove('border');
    }


    fly2!.classList.remove('fly2');
    fly2!.classList.add('fly');//
  }

  addRing(){
    var fly = document.getElementById('flyRing');

    fly!.classList.add('border');//

  }

  endFlyAnimation() {
    // var fly = document.getElementById('flyRing');

    var fly2 = document.getElementById('fly');

    // fly!.classList.add('border');

    fly2!.classList.remove('fly');
    fly2!.classList.add('fly2');
  }

}
