import { Component, OnInit, ViewChild, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser, NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { StripeService, StripeCardComponent } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';import { PaymentService } from '../../services/payment';
import { OrderService } from '../../services/order';
import { CartService } from '../../services/cart';
import { firstValueFrom } from 'rxjs';

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, StripeCardComponent]
})
export class PaymentComponent implements OnInit {

  @ViewChild(StripeCardComponent)
  card!: StripeCardComponent;

  constructor(
    private auth: AuthService,
    private router: Router,
    private stripe: StripeService,
    private paymentService: PaymentService,
    private cartService: CartService,
  private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  navScrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.navScrolled = window.scrollY > 50;
    }
  }

  logout() { this.auth.logout(); }

  orderItems: { name: string; quantity: number; price: number }[] = [];
  deliveryFee = 7;
  subtotal = 0;
  total = 0;

  // Options pour la carte Stripe
  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      }
    }
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'fr'
  };

  paying = false;
  paymentOk = false;
  errorMsg = '';

  
ngOnInit() {
  this.cartService.getCartItems().subscribe({
    next: (items: any[]) => {
      this.orderItems = items.map((item: any) => ({
        name: item.meal.name,
        quantity: item.quantity,
        price: item.meal.price
      }));
      this.subtotal = this.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
      this.total = this.subtotal + this.deliveryFee;
      if (this.orderItems.length === 0) {
        this.router.navigate(['/cart']);
      }
    },
    error: (err) => {console.error(err);
        this.router.navigate(['/cart']);
    }
  });
}
 

async pay() {
  if (this.paying) return;

  this.paying = true;
  this.errorMsg = '';

  try {

    // ✅ STOP si panier vide (sécurité frontend)
    if (this.orderItems.length === 0) {
      this.errorMsg = "Panier vide";
      this.paying = false;
      return;
    }

    // 1. créer order
    let order: any;

    try {
      order = await firstValueFrom(
        this.orderService.createOrderFromCart(this.deliveryFee)
      );
    } catch (err: any) {

      // ✅ gérer erreur backend
      if (err?.error?.error === 'Cart empty') {
        this.errorMsg = "Votre panier est déjà vide";
        this.paying = false;
        return;
      }

      throw err;
    }

    // 2. payment intent
    const res: any = await firstValueFrom(
      this.paymentService.createPaymentIntent(order.id)
    );

    const clientSecret = res.client_secret;

    if (!clientSecret) throw new Error("clientSecret manquant");

    // 3. Stripe
    const result = await firstValueFrom(
      this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.card.element }
      })
    );

    if (result.error) {
      this.errorMsg = result.error.message || 'Payment failed';
      this.paying = false;
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {

      // ✅ UPDATE STATUS (important)
      await firstValueFrom(
        this.orderService.updateOrderStatus(order.id, 'paid')
      );

      // ✅ SUCCESS UI
      this.paymentOk = true;
      this.paying = false;

      // ✅ vider panier côté frontend aussi
      this.orderItems = [];

      setTimeout(() => {
        this.router.navigate(['/orders']);
      }, 2000);
    }

  } catch (err: any) {
    console.error(err);
    this.errorMsg = err?.error?.error || err.message || 'Erreur paiement';
    this.paying = false;
  }
}
}