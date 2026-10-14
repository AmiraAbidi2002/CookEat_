import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  testimonials = [
    {
      text: "J’ai essayé Ramen et salade Quinoa. C’est très bon et facile à suivre.",
      name: "Chaima"
    },
    {
      text: "Livraison rapide et ingrédients frais. Très satisfaite !",
      name: "Sarra"
    },
    {
      text: "Concept génial pour gagner du temps en semaine.",
      name: "Youssef"
    }
  ];

  currentIndex = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.testimonials.length) %
      this.testimonials.length;
  }

  ngAfterViewInit() {
    const elements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });

    elements.forEach(el => observer.observe(el));
  }
}