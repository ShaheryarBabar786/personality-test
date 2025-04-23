import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  showNotification: boolean = true;
  max: number = 100;
  value: number = 65; // Example value
  imageUrl: string = './../../assets/images.jpg'; // Your image path

  closeNotification(): void {
    this.showNotification = false;
  }
}
