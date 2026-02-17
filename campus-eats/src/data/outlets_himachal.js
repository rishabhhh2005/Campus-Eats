// src/data/outlets_himachal.js
// Dataset for Himachal campus. Mirrors the same schema as Punjab `OUTLETS`.
export const OUTLETS_HIMACHAL = [
  {
    slug: "dominos",
    name: "Domino's",
    short: "DOMINOS",
    rating: 4.2,
    eta: "20–30 min",
    cuisine: "Pizza • Italian",
    orders: 21050,
    min: 99,
    image: "/outlets/dominos.jpg",
    menu: [
      { id: "d1", name: "Margherita Pizza", desc: "Classic cheese", price: 199, image: "/menu/dominos/dominos_margherita.png", category: "Pizzas", isVeg: true },
      { id: "d2", name: "Pepperoni Pizza", desc: "Spicy pepperoni", price: 249, image: "/menu/dominos/dominos_pepperoni.avif", category: "Pizzas", isVeg: false },
      { id: "d3", name: "Garlic Bread", desc: "Buttery, cheesy", price: 79, image: "/menu/dominos/dominos_garlic.avif", category: "Sides", isVeg: true },
      { id: "d4", name: "FarmHouse Pizza", desc: "Classic cheese", price: 399, image: "/menu/dominos/dominos_farmhouse.webp", category: "Pizzas", isVeg: true },
      { id: "d5", name: "Extra Cheese Pizza", desc: "Classic cheese Burst", price: 499, image: "/menu/dominos/dominos_extracheese.png", category: "Pizzas", isVeg: true },
      { id: "d6", name: "ChocoLava Cake", desc: "Chocolate Burst", price: 99, image: "/menu/dominos/dominos_chocolava.jpeg", category: "Sides", isVeg: true },
      { id: "d7", name: "Regular Pepsi", desc: "150ml", price: 79, image: "/menu/dominos/dominos_pepsi.png", category: "Sides", isVeg: true },
      { id: "d8", name: "Chicken  Pizza", desc: "Classic Chicken", price: 799, image: "/menu/dominos/dominos_chickenspecial.jpg", category: "Pizzas", isVeg: false },
    ]
  },
  {
    slug: "haldirams",
    name: "Haldirams",
    short: "HALDIRAMS",
    rating: 4.3,
    eta: "20–30 min",
    cuisine: "Indian • Snacks • Sweets",
    orders: 14590,
    min: 149,
    image: "/outlets/haldirams.png",
    menu: [
      { id: "h1", name: "Chole Bature", desc: "Crispy & spicy", price: 59, image: "/menu/haldirams/cholebature.jpeg", category: "Snacks", isVeg: true },
      { id: "h2", name: "Paneer Wrap", desc: "Spicy paneer", price: 139, image: "/menu/haldirams/haldirams_wrap.jpeg", category: "Wraps", isVeg: true },
      { id: "h3", name: "Kulfi", desc: "Sweet dish", price: 99, image: "/menu/haldirams/kulfi.jpg", category: "Sweets", isVeg: true }
    ]
  },
  {
    slug: "ccd",
    name: "CCD",
    short: "CCD",
    rating: 4.3,
    eta: "15–25 min",
    cuisine: "Coffee • Beverages",
    orders: 12010,
    min: 89,
    image: "/outlets/ccd.jpeg",
    menu: [
      { id: "c1", name: "Cappuccino", desc: "Creamy coffee", price: 99, image: "/menu/ccd/ccd_cappuccino.jpeg", category: "Beverages", isVeg: true },
      { id: "c5", name: "Latte", desc: "Rich coffee with milk", price: 119, image: "/menu/ccd/ccd_latte.jpeg", category: "Beverages", isVeg: true },
      { id: "c3", name: "Cold Coffee", desc: "Iced coffee", price: 149, image: "/menu/ccd/ccd_coldcoffee.jpeg", category: "Beverages", isVeg: true }
    ]
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    short: "SBUX",
    rating: 4.4,
    eta: "15-25 min",
    cuisine: "Coffee • Beverages • Snacks",
    orders: 15480,
    min: 199,
    image: "/outlets/starbucks.jpg",
    menu: [
      { id: "sb1", name: "Caffe Latte", desc: "Espresso with steamed milk", price: 299, image: "/menu/starbucks/sb_CaffeLatte.jpeg", category: "Hot Coffee", isVeg: true },
      { id: "sb3", name: "Chocolate Muffin", desc: "Fresh baked", price: 199, image: "/menu/starbucks/sb_chocolatemuffin.jpeg", category: "Bakery", isVeg: true }
    ]
  }
];


