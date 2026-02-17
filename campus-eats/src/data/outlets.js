// src/data/outlets.js
export const OUTLETS = [
  {
    slug: "dominos",
    name: "Domino's",
    short: "DOMINOS",
    rating: 4.3,
    eta: "25–35 min",
    cuisine: "Pizza • Italian",
    orders: 32097,
    min: 99,
    image: "/outlets/dominos.jpg",
    menu: [
      { id: "d1", name: "Margherita Pizza", desc: "Classic cheese", price: 10, image: "/menu/dominos/dominos_margherita.png", category: "Pizzas", isVeg: true },
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
    slug: "kfc",
    name: "KFC",
    short: "KFC",
    rating: 4.2,
    eta: "20–30 min",
    cuisine: "Fried Chicken • Fast Food",
    orders: 28740,
    min: 149,
    image: "/outlets/kfc.jpg",
    menu: [
      { id: "k1", name: "Bucket (10 pcs)", desc: "Crispy chicken", price: 499, image: "/menu/kfc/kfc_bucket.jpg", category: "Buckets", isVeg: false },
      { id: "k2", name: "Zinger Burger", desc: "Spicy chicken burger", price: 149, image: "/menu/kfc/kfc_zinger.webp", category: "Burgers", isVeg: false },
      { id: "k3", name: "Chicken Burger", desc: "Crispy veg patty", price: 99, image: "/menu/kfc/kfc_vegburger.jpg", category: "Burgers", isVeg: false },
      { id: "k4", name: "Hot Wings (8 pcs)", desc: "Spicy chicken wings", price: 299, image: "/menu/kfc/kfc_hotwings.jpeg", category: "Sides", isVeg: false },
      { id: "k5", name: "Chicken Popcorn", desc: "Bite-sized chicken", price: 159, image: "/menu/kfc/kfc_popcorn.webp", category: "Snacks", isVeg: false },
      { id: "k6", name: "French Fries", desc: "Crispy potato fries", price: 99, image: "/menu/kfc/kfc_fries.jpeg", category: "Sides", isVeg: true }
    ]
  },
  {
    slug: "mcd",
    name: "McDonalds",
    short: "McD",
    rating: 4.1,
    eta: "20–30 min",
    cuisine: "Burgers • Fast Food",
    orders: 40210,
    min: 99,
    image: "/outlets/mcdonalds.png",
    menu: [
      { id: "m1", name: "Big Mac", desc: "Signature burger", price: 229, image: "/menu/mcd/mcd_bigmac.jpeg", category: "Burgers", isVeg: false },
      { id: "m2", name: "McVeggie", desc: "Veggie burger", price: 149, image: "/menu/mcd/mcd_mcveggie.jpeg", category: "Burgers", isVeg: true },
      { id: "m3", name: "Fries (M)", desc: "Crispy fries", price: 79, image: "/menu/mcd/mcd_fries.webp", category: "Sides", isVeg: true },
      { id: "m4", name: "McChicken", desc: "Classic chicken burger", price: 179, image: "/menu/mcd/mcd_mcchicken.jpeg", category: "Burgers", isVeg: false },
      { id: "m5", name: "McFlurry Oreo", desc: "Ice cream with Oreo", price: 129, image: "/menu/mcd/mcd_mcflurryoreo.avif", category: "Desserts", isVeg: true },
      { id: "m6", name: "Nuggets (6 pcs)", desc: "Chicken nuggets", price: 159, image: "/menu/mcd/mcd_nuggets.jpeg", category: "Sides", isVeg: false }
    ]
  },
  {
    slug: "ccd",
    name: "CCD",
    short: "CCD",
    rating: 4.4,
    eta: "15–25 min",
    cuisine: "Coffee • Beverages",
    orders: 17146,
    min: 89,
    image: "/outlets/ccd.jpeg",
    menu: [
      { id: "c1", name: "Cappuccino", desc: "Creamy coffee", price: 99, image: "/menu/ccd/ccd_cappuccino.jpeg", category: "Beverages", isVeg: true },
      { id: "c2", name: "Veg Sandwich", desc: "Grilled sandwich", price: 129, image: "/menu/ccd/ccd_vegsandwich.jpeg", category: "Food", isVeg: true },
      { id: "c3", name: "Cold Coffee", desc: "Iced coffee", price: 149, image: "/menu/ccd/ccd_coldcoffee.jpeg", category: "Beverages", isVeg: true },
      { id: "c4", name: "Chocolate Muffin", desc: "Fresh baked muffin", price: 89, image: "/menu/ccd/ccd_chocolatemuffin.jpeg", category: "Desserts", isVeg: true },
      { id: "c5", name: "Latte", desc: "Rich coffee with milk", price: 119, image: "/menu/ccd/ccd_latte.jpeg", category: "Beverages", isVeg: true },
      { id: "c6", name: "Chicken Roll", desc: "Spicy chicken wrap", price: 159, image: "/menu/ccd/ccd_chickenroll.png", category: "Food", isVeg: false }
    ]
  },
  {
    slug: "br",
    name: "Baskin Robbins",
    short: "BR",
    rating: 4.5,
    eta: "20–25 min",
    cuisine: "Ice Cream • Desserts",
    orders: 19350,
    min: 99,
    image: "/outlets/baskinrobins.png",
    menu: [
      { id: "b1", name: "2 Scoop Cup", desc: "Choose flavors", price: 149, image: "/menu/br/br_2scoopcup.jpeg", category: "Ice Cream", isVeg: true },
      { id: "b2", name: "Sundae", desc: "Classic sundae", price: 129, image: "/menu/br/br_sundae.jpeg", category: "Sundaes", isVeg: true },
      { id: "b3", name: "Waffle Cone", desc: "Fresh waffle cone", price: 169, image: "/menu/br/br_wafflecone.jpeg", category: "Ice Cream", isVeg: true },
      { id: "b4", name: "Ice Cream Cake", desc: "Birthday special", price: 599, image: "/menu/br/br_icecreamcake.jpeg", category: "Cakes", isVeg: true },
      { id: "b5", name: "Banana Split", desc: "Classic dessert", price: 249, image: "/menu/br/br_bananasplit.jpeg", category: "Sundaes", isVeg: true },
      { id: "b6", name: "Milkshake", desc: "Choice of flavor", price: 199, image: "/menu/br/br_milkshake.jpeg", category: "Beverages", isVeg: true }
    ]
  },
  {
    slug: "bk",
    name: "Burger King",
    short: "BK",
    rating: 4.2,
    eta: "25–35 min",
    cuisine: "Burgers • Fast Food",
    orders: 25400,
    min: 99,
    image: "/outlets/burgerking.png",
    menu: [
      { id: "bk1", name: "Whopper", desc: "Flame-grilled", price: 249, image: "/menu/burgerking/bk_whopper.jpeg", category: "Burgers", isVeg: false },
      { id: "bk2", name: "Veg Whopper", desc: "Veg version", price: 199, image: "/menu/burgerking/bk_vegwhopper.jpeg", category: "Burgers", isVeg: true },
      // { id: "bk3", name: "Chicken Royale", desc: "Crispy chicken", price: 179, image: "/menu/burgerking/bk_chickenroyale.jpeg", category: "Burgers", isVeg: false },
      { id: "bk4", name: "Crispy Fries", desc: "Golden fries", price: 89, image: "/menu/burgerking/bk_crispyfries.avif", category: "Sides", isVeg: true },
      { id: "bk5", name: "Chicken Wings", desc: "Spicy wings", price: 219, image: "/menu/burgerking/bk_crispywings.jpeg", category: "Sides", isVeg: false },
      { id: "bk6", name: "Chocolate Shake", desc: "Rich shake", price: 129, image: "/menu/burgerking/bk_chocolateshake.jpeg", category: "Beverages", isVeg: true },
      { id: "bk3", name: "Chicken Fries", desc: "Crispy fries", price: 129, image: "/menu/burgerking/bk_chickenfries.jpeg", category: "Sides", isVeg: false }
    ]
  },
  {
    slug: "subway",
    name: "Subway",
    short: "SUBWAY",
    rating: 4.3,
    eta: "20–30 min",
    cuisine: "Healthy • Sandwiches",
    orders: 14560,
    min: 119,
    image: "/outlets/subway.png",
    menu: [
      { id: "s1", name: "Veggie Delight", desc: "Veg sandwich", price: 149, image: "/menu/subway/subway_veggiedelite.jpeg", category: "Subs", isVeg: true },
      { id: "s2", name: "Chicken Teriyaki", desc: "Grilled chicken", price: 199, image: "/menu/subway/subway_chickenteriyaki.jpeg", category: "Subs", isVeg: false },
      { id: "s3", name: "Cookies (3pc)", desc: "Fresh baked", price: 99, image: "/menu/subway/subway_cookies.jpeg", category: "Sides", isVeg: true }
    ]
  },
  {
    slug: "haldirams",
    name: "Haldirams",
    short: "HALDIRAMS",
    rating: 4.4,
    eta: "25–35 min",
    cuisine: "Indian • Snacks • Sweets",
    orders: 17890,
    min: 149,
    image: "/outlets/haldirams.png",
    menu: [
      { id: "h1", name: "Chole Bature", desc: "Crispy & spicy", price: 49, image: "/menu/haldirams/cholebature.jpeg", category: "Snacks", isVeg: true },
      { id: "h2", name: "Paneer Wrap", desc: "Spicy paneer", price: 129, image: "/menu/haldirams/haldirams_wrap.jpeg", category: "Wraps", isVeg: true },
      { id: "h3", name: "Kulfi", desc: "Sweet dish", price: 99, image: "/menu/haldirams/kulfi.jpg", category: "Sweets", isVeg: true }
    ]
  },
  {
    slug: "belgianwaffle",
    name: "Belgian Waffle",
    short: "BW",
    rating: 5.0,
    eta: "25–35 min",
    cuisine: "Desserts • Waffles",
    orders: 30780,
    min: 149,
    image: "/outlets/Belgian-Waffle.jpg",
    menu: [
      { id: "h1", name: " Chocolate Waffle", desc: "Chocolate", price: 249, image: "/menu/belgianwaffle/bw_darkchocolate.jpeg", category: "Dessert", isVeg: true },
      { id: "h2", name: "Vanilla Waffle", desc: "Sweet Vanilla", price: 219, image: "/menu/belgianwaffle/bw_vanilla.jpg", category: "Dessert", isVeg: true },
      { id: "h3", name: "Stawberry Waffle", desc: "Sweet Stawberry", price: 199, image: "/menu/belgianwaffle/bw_stawberry.jpeg", category: "Dessert", isVeg: true },
      // { id: "h4", name: "Lotus Biscoff Waffle", desc: "Sweet Biscuit", price: 499, image: "/menu/belgianwaffle/bw_lotusbiscoff.jpg", category: "Dessert", isVeg: true },
      { id: "h4", name: "Waffle Bites(3 pckts)", desc: "Sweet Crunchy", price: 1199, image: "/menu/belgianwaffle/bw_waffles.jpg", category: "Dessert", isVeg: true }
    ]
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    short: "SBUX",
    rating: 4.4,
    eta: "15-25 min",
    cuisine: "Coffee • Beverages • Snacks",
    orders: 21450,
    min: 199,
    image: "/outlets/starbucks.jpg",
    menu: [
      { id: "sb1", name: "Caffe Latte", desc: "Espresso with steamed milk", price: 299, image: "/menu/starbucks/sb_CaffeLatte.jpeg", category: "Hot Coffee", isVeg: true },
      { id: "sb2", name: "Frappuccino", desc: "Blended ice beverage", price: 349, image: "/menu/starbucks/sb_frappuccino.webp", category: "Cold Coffee", isVeg: true },
      { id: "sb3", name: "Chocolate Muffin", desc: "Fresh baked", price: 199, image: "/menu/starbucks/sb_chocolatemuffin.jpeg", category: "Bakery", isVeg: true },
      { id: "sb4", name: "Chicken Sandwich", desc: "Classic sandwich", price: 299, image: "/menu/starbucks/sb_chickensandwich.webp", category: "Food", isVeg: false }
    ]
  },
  {
    slug: "pizzahut",
    name: "Pizza Hut",
    short: "PH",
    rating: 4.1,
    eta: "30-40 min",
    cuisine: "Pizza • Italian • Fast Food",
    orders: 28900,
    min: 199,
    image: "/outlets/pizzahut.png",
    menu: [
      { id: "ph1", name: "Tandoori Paneer Pizza", desc: "Spicy paneer pizza", price: 399, image: "/menu/pizzahut/pz_tandooripaneer.jpeg", category: "Pizzas", isVeg: true },
      { id: "ph2", name: "Chicken  Pizza", desc: "Loaded chicken pizza", price: 499, image: "/menu/pizzahut/pz_chickensupreme.jpg", category: "Pizzas", isVeg: false },
      { id: "ph3", name: "Garlic Breadsticks", desc: "Fresh baked", price: 149, image: "/menu/pizzahut/pz_garlicbread.jpeg", category: "Sides", isVeg: true },
      { id: "ph4", name: "Pasta Alfredo", desc: "Creamy pasta", price: 299, image: "/menu/pizzahut/pz_pastaalfredo.jpeg", category: "Pasta", isVeg: true }
    ]
  },
  {
    slug: "dunkin",
    name: "Dunkin Donuts",
    short: "DNKN",
    rating: 4.2,
    eta: "20-30 min",
    cuisine: "Donuts • Beverages • Desserts",
    orders: 18450,
    min: 149,
    image: "/outlets/dunkindonuts.png",
    menu: [
      { id: "dd1", name: "Classic Donut Box", desc: "6 assorted donuts", price: 399, image: "/menu/dunkindonuts/chocolatebox.avif", category: "Donuts", isVeg: true },
      { id: "dd2", name: "Chocolate Donut", desc: "Rich chocolate", price: 89, image: "/menu/dunkindonuts/chocolatedonut.webp", category: "Donuts", isVeg: true },
      { id: "dd3", name: "Iced Coffee", desc: "Signature brew", price: 199, image: "/menu/dunkindonuts/icedcoffee.jpeg", category: "Beverages", isVeg: true },
      { id: "dd4", name: "Chicken Wrap ", desc: "Grilled Wrap", price: 249, image: "/menu/dunkindonuts/chickenwrap.jpeg", category: "Food", isVeg: false }
    ]
  },
  {
    slug: "tacobell",
    name: "Taco Bell",
    short: "TB",
    rating: 4.0,
    eta: "25-35 min",
    cuisine: "Mexican • Fast Food",
    orders: 16890,
    min: 179,
    image: "/outlets/tacobell.jpg",
    menu: [
      { id: "tb1", name: "Crunchy Taco", desc: "Classic taco", price: 179, image: "/menu/tacobell/crunchytaco.jpeg", category: "Tacos", isVeg: false },
      { id: "tb2", name: "Mexican Pizza", desc: "Crispy flatbread", price: 249, image: "/menu/tacobell/mexicanpizza.jpeg", category: "Mexican Pizza", isVeg: true },
      { id: "tb3", name: "Burrito Supreme", desc: "Loaded burrito", price: 299, image: "/menu/tacobell/burrito.jpeg", category: "Burritos", isVeg: false },
      { id: "tb4", name: "Nachos", desc: "With cheese sauce", price: 199, image: "/menu/tacobell/nachos.jpeg", category: "Sides", isVeg: true }
    ]
  },
  {
    slug: "gianis",
    name: "Giani's",
    short: "GIANI",
    rating: 4.3,
    eta: "20-30 min",
    cuisine: "Ice Cream • Desserts • Shakes",
    orders: 14560,
    min: 149,
    image: "/outlets/gianis.jpeg",
    menu: [
      { id: "gi1", name: "Chocolate Scoop", desc: "Classic Ice Cream", price: 199, image: "/menu/gianis/chocolatescoop.jpeg", category: "Ice Cream", isVeg: true },
      { id: "gi2", name: "Thick Shake", desc: "Choice of flavors", price: 179, image: "/menu/gianis/thickshake.jpeg", category: "Shakes", isVeg: true },
      { id: "gi3", name: "Rainbow Cassata ", desc: "Multiflavour", price: 599, image: "/menu/gianis/rainbowcassatta.jpeg", category: "Cakes", isVeg: true },
      { id: "gi4", name: "Stawberry Scoop", desc: "Classic IcE Cream", price: 249, image: "/menu/gianis/stawberryscoop.avif", category: "Ice Cream", isVeg: true }
    ]
  },
  {
    slug: "barista",
    name: "Barista",
    short: "BRST",
    rating: 4.1,
    eta: "20-30 min",
    cuisine: "Coffee • Beverages • Snacks",
    orders: 12780,
    min: 149,
    image: "/outlets/barista.jpeg",
    menu: [
      { id: "br1", name: "Espresso", desc: "Strong coffee", price: 149, image: "/menu/barista/espresso.jpeg", category: "Coffee", isVeg: true },
      { id: "br2", name: "Cold Coffee", desc: "With ice cream", price: 199, image: "/menu/barista/coldcoffee.jpeg", category: "Beverages", isVeg: true },
      { id: "br3", name: "Chicken Sandwich", desc: "Grilled chicken", price: 249, image: "/menu/barista/chickensandwich.webp", category: "Food", isVeg: false },
      { id: "br4", name: "Chocolate Cookie", desc: "Fresh baked", price: 99, image: "/menu/barista/chocochipcookie.jpeg", category: "Snacks", isVeg: true }
    ]
  },
  {
    slug: "lapinoz",
    name: "La Pino'z",
    short: "LAPZ",
    rating: 4.0,
    eta: "30-40 min",
    cuisine: "Pizza • Italian • Fast Food",
    orders: 15670,
    min: 199,
    image: "/outlets/lapinoz.png",
    menu: [
      { id: "lp1", name: "Mexican Pizza", desc: "Spicy mexican", price: 299, image: "/menu/lapinoz/mexicanpizza.jpeg", category: "Pizzas", isVeg: true },
      { id: "lp2", name: "White Sauce Pasta", desc: "Creamy pasta", price: 249, image: "/menu/lapinoz/whitesaucepasta.jpeg", category: "Pasta", isVeg: true },
      { id: "lp3", name: "Chicken Pizza", desc: "BBQ chicken", price: 399, image: "/menu/lapinoz/chickenpizza.jpeg", category: "Pizzas", isVeg: false },
      { id: "lp4", name: "Garlic Bread", desc: "With cheese", price: 149, image: "/menu/lapinoz/garlicbread.jpeg", category: "Sides", isVeg: true }
    ]
  },
   {
    slug: "amul",
    name: "Amul Ice Cream",
    short: "AMUL",
    rating: 4.3,
    eta: "15-25 min",
    cuisine: "Ice Cream • Desserts",
    orders: 15670,
    min: 99,
    image: "/outlets/amul.webp",
    menu: [
      { id: "am1", name: "Butterscotch", desc: "Classic flavor", price: 99, image: "/menu/amul/amul_butterscotch.webp", category: "Ice Cream", isVeg: true },
      { id: "am2", name: "Chocolate Chip", desc: "Rich chocolate", price: 119, image: "/menu/amul/amul_chocochip.jpeg", category: "Ice Cream", isVeg: true },
      { id: "am3", name: "Milk Packet", desc: "450 ml pack", price: 49, image: "/menu/amul/amul_milk.jpeg", category: "Family Pack", isVeg: true },
      { id: "am4", name: "Mango Dolly", desc: "Stick ice cream", price: 140, image: "/menu/amul/amul_mango.jpg", category: "Ice Cream", isVeg: true }
    ]
  }
];
