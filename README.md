**🍽️ CookEat — Recipe Discovery & Ingredient Marketplace**

CookEat is a full-stack web application that helps users discover recipes and purchase the ingredients they need to prepare their favorite meals. The platform offers complete ingredient lists for each recipe and allows customers to order individual ingredients, including rare or hard-to-find products, depending on availability. Users can explore recipes, check ingredient availability, add products to their cart, and pay securely online using Stripe. Administrators manage recipes, ingredients, product availability, and orders through a dedicated dashboard. An integrated chatbot, Yummy, assists users in discovering recipes and finding the ingredients they need.


| Part               | Folder                             |  Stack                                                                |
|--------------------|------------------------------------|-----------------------------------------------------------------------|
| Client application | [`frontend/`](./frontend)          | Angular, TypeScript, HTML5, CSS3                                      |
| REST API           | [`backend/`](./backend)            | Python, Django, Django REST Framework, SimpleJWT                      |
| Database           | `backend/db.sqlite3`               | SQLite (filled from the CSV)                                          |
| Dataset            | [`data/meals_dataset.csv`](./data) | CSV                                                                   |
| Payment            | Stripe (test mode)                 | Stripe API + Stripe Elements                                          |
| Chatbot            | Yummy                              | Chatbot trained on `meals_dataset.csv`, integrated through an API key |

---

## ✨ Features

### 👤 Customer
- Home page with search bar and a meal carousel.
- Sign up / log in (JWT authentication), personal profile with edit option.
- Meal page: photo, price, category, preparation time, ingredients, step-by-step recipe.
- Favorites, cart (quantity, delivery fee, order summary) and Place Order.
- Secure Payment: page powered by Stripe (card payment, order summary).
- My Orders: order history with filters (All, Pending, Preparing, Delivered, Cancelled, Paid).
- Yummy: chatbot available on every page (floating button, bottom right).

### 🛠️ Administrator
- Dedicated admin space with four sections: Overview, Categories, Meals, Orders.
- Categories: create, edit, delete (Dessert, Vegetarian, Chicken, Beef, Seafood, Pasta, Fast Food…).
- Meals: create / edit / delete with image upload, price, category and availability.
- Orders: search by client or meal, filter by status, update status (Pending → Preparing → Delivered / Cancelled).
- Overview dashboard: revenue over the last 14 days, orders by status, top 5 meals, recent orders.

---

## 🏗️ Architecture


 Browser (Customer / Admin)
          │
          ▼
 ┌─────────────────────┐   REST / JSON + JWT   ┌──────────────────────────┐
 │  Angular frontend   │ ────────────────────► │  Django REST backend     │
 │  pages, cart, admin │                       │  auth, meals, orders     │
 │  Yummy chat widget  │                       │  Stripe payment endpoints│
 └─────────┬───────────┘                       └───────┬─────────┬────────┘
           │                                           │         │
           │ messages                         ORM      ▼         ▼ API
           ▼                                      SQLite DB   Stripe
   Yummy chatbot API  ◄── knowledge base ──  meals_dataset.csv ──► import script ──► SQLite DB


---

## 🔙 Backend (`backend/`)

Django + Django REST Framework API.

Main responsibilities
- Authentication: registration, login, token refresh (SimpleJWT); roles customer and admin.
- Catalog: categories and meals (title, description, price in DT, image, ingredients, recipe steps, prep time, difficulty, availability).
- Cart & orders: create an order from the cart, order items, delivery fee, status workflow.
- Payment (Stripe): the backend creates a Stripe PaymentIntent for the order total and confirms the payment status (webhook), then marks the order as Paid. The Stripe secret key stays on the server only.
- Admin statistics: revenue per day, orders by status, best-selling meals.
- CSV import: a management command loads `meals_dataset.csv` into the database.



---

## 🎨 Frontend (`frontend/`)

Angular application.

Main pages: Home · Menu · Meal detail · Login / Register · Profile · Cart · Payment · My Orders · Admin (Overview, Categories, Meals, Orders).

Highlights
- Services call the Django API with an HTTP interceptor that attaches the JWT.
- Route guards protect customer pages and the admin area.
- The payment page uses Stripe.js / Elements with the publishable key only.
- The Yummy widget is a floating chat component present on all pages.

---


---

## ⚙️ Installation

**Prerequisites**: Git, Python 3.10+, Node.js + npm, Angular CLI (`npm i -g @angular/cli`), a Stripe account (test mode).


git clone https://github.com/AmiraAbidi2002/CookEat_.git
cd CookEat


### 1. Backend

cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in the keys
python manage.py migrate
python manage.py createsuperuser


### 2. Import the dataset

python manage.py import_meals ../data/meals_dataset.csv  
python manage.py runserver                                # http://127.0.0.1:8000

### 3. Frontend
cd ../frontend
npm install
ng serve                                                  # http://localhost:4200



## 👩‍💻 Author
Developed by Amira + Ghada + Sarra, as a full-stack web project — Angular · Django REST · Stripe · Chatbot.

---
**CookEat — Discover recipes, find the right ingredients, and bring every dish to life.** 🍅
