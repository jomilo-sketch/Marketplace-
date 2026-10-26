/* ============================================================
   BOUESTI MARKETPLACE — app.js
   Full functionality: Auth, Cart, Checkout, Animations,
   Scroll effects, Transitions, IntersectionObserver reveals
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. DATA LAYER
────────────────────────────────────────────────────────────── */
const EKITI_LGAS = [
  'Ado-Ekiti','Efon','Ekiti East','Ekiti South-West','Ekiti West',
  'Emure','Gbonyin','Ido-Osi','Ijero','Ikere','Ikole','Ilejemeje',
  'Irepodun/Ifelodun','Ise/Orun','Moba','Oye'
];

/* The 10 product categories, in display order. kind = which section of the website shows them. */
const CATEGORIES = [
  { key:"tubers", label:"Tubers and root crops", short:"Tubers & Roots", kind:"produce" },
  { key:"grains", label:"Grains and cereals", short:"Grains & Cereals", kind:"produce" },
  { key:"legumes", label:"Legumes, beans and oilseeds", short:"Legumes, Beans & Oilseeds", kind:"produce" },
  { key:"fruits", label:"Fruits and nuts", short:"Fruits & Nuts", kind:"produce" },
  { key:"vegetables", label:"Vegetables", short:"Vegetables", kind:"produce" },
  { key:"spices", label:"Spices, herbs and traditional seasonings", short:"Spices, Herbs & Seasonings", kind:"produce" },
  { key:"processed", label:"Processed agricultural produce", short:"Processed Produce", kind:"produce" },
  { key:"livestock", label:"Livestock and animal products", short:"Livestock & Animal Products", kind:"livestock" },
  { key:"poultry", label:"Poultry products", short:"Poultry Products", kind:"livestock" },
  { key:"fish", label:"Fish and aquaculture products", short:"Fish & Aquaculture", kind:"livestock" },
];

const PRODUCE = [
  { id:"p-yam", category:"tubers", name:"White Yam Tuber", unit:"tuber", price:1800, stock:40, img:"yam", desc:"Large, premium white yam from the famous Ikole yam belt of Ekiti.", measures:[{"unit":"tuber","qty":1,"key":"tuber-1","label":"1 tuber"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 tubers)"},{"unit":"heap","qty":5,"key":"heap-5","label":"Heap (5 tubers)"}] },
  { id:"p-yam-water", category:"tubers", name:"Water Yam (Ewura)", unit:"tuber", price:1500, stock:30, img:"yam_water", desc:"Soft, moist water yam — great boiled, pounded or in porridge.", measures:[{"unit":"tuber","qty":1,"key":"tuber-1","label":"1 tuber"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 tubers)"},{"unit":"heap","qty":5,"key":"heap-5","label":"Heap (5 tubers)"}] },
  { id:"p-yam-yellow", category:"tubers", name:"Yellow Yam", unit:"tuber", price:2000, stock:25, img:"yam_yellow", desc:"Golden-fleshed yam with a rich taste, lovely for boiling and frying.", measures:[{"unit":"tuber","qty":1,"key":"tuber-1","label":"1 tuber"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 tubers)"},{"unit":"heap","qty":5,"key":"heap-5","label":"Heap (5 tubers)"}] },
  { id:"p-potato", category:"tubers", name:"Sweet Potato", unit:"heap", price:820, stock:37, img:"potato", desc:"Red-skinned sweet potatoes — naturally sweet.", measures:[{"unit":"heap","qty":1,"kg":1.5,"key":"heap-1.5","label":"1 heap"},{"unit":"basin","qty":6,"kg":9,"key":"basin-9","label":"Basin (≈9 kg)"},{"unit":"bag","qty":20,"kg":30,"key":"bag-30","label":"Bag (30 kg)"}] },
  { id:"p-irish", category:"tubers", name:"Irish Potato", unit:"paint_rubber", price:4950, stock:10, img:"irish_potato", desc:"Firm Irish potatoes for chips, porridge and stews.", measures:[{"unit":"paint_rubber","qty":1,"kg":4.5,"key":"paint_rubber-4.5","label":"1 paint rubber"},{"unit":"bag","qty":11.111,"kg":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-cocoyam", category:"tubers", name:"Cocoyam (Taro)", unit:"heap", price:1600, stock:20, img:"cocoyam", desc:"Starchy cocoyam corms, used for soups and pottage.", measures:[{"unit":"heap","qty":1,"kg":2,"key":"heap-2","label":"1 heap"},{"unit":"basket","qty":7.5,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"},{"unit":"bag","qty":20,"kg":40,"key":"bag-40","label":"Bag (40 kg)"}] },
  { id:"p-cassava", category:"tubers", name:"Fresh Cassava", unit:"heap", price:1800, stock:20, img:"cassava", desc:"Freshly harvested cassava roots, ready for fufu or garri.", measures:[{"unit":"heap","qty":1,"kg":4,"key":"heap-4","label":"1 heap"},{"unit":"bag","qty":12,"kg":48,"key":"bag-48","label":"Bag (48 kg)"}] },
  { id:"p-beetroot", category:"tubers", name:"Beetroot", unit:"bunch", price:1000, stock:30, img:"beetroot", desc:"Deep red, sweet beetroot for salads, juices and stews.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"basket","qty":10,"key":"basket-10","label":"Basket (10 bunches)"}] },
  { id:"p-radish", category:"tubers", name:"Radish (White)", unit:"bunch", price:700, stock:25, img:"radish", desc:"Crisp, peppery white radish, eaten raw or lightly cooked.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"basket","qty":10,"key":"basket-10","label":"Basket (10 bunches)"}] },
  { id:"p-turnip", category:"tubers", name:"Turnip", unit:"bunch", price:800, stock:20, img:"turnip", desc:"Mild, slightly sweet turnips for soups, stews and roasting.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"basket","qty":8,"key":"basket-8","label":"Basket (8 bunches)"}] },
  { id:"p-potato-orange", category:"tubers", name:"Orange-Fleshed Sweet Potato", unit:"heap", price:1050, stock:30, img:"potato_orange", desc:"Sweet, vitamin-A-rich orange sweet potato.", measures:[{"unit":"heap","qty":1,"kg":1.5,"key":"heap-1.5","label":"1 heap"},{"unit":"basin","qty":6,"kg":9,"key":"basin-9","label":"Basin (≈9 kg)"},{"unit":"bag","qty":20,"kg":30,"key":"bag-30","label":"Bag (30 kg)"}] },
  { id:"p-potato-purple", category:"tubers", name:"Purple Sweet Potato", unit:"heap", price:1350, stock:20, img:"potato_purple", desc:"Purple-fleshed sweet potato with a rich, nutty sweetness.", measures:[{"unit":"heap","qty":1,"kg":1.5,"key":"heap-1.5","label":"1 heap"},{"unit":"basin","qty":6,"kg":9,"key":"basin-9","label":"Basin (≈9 kg)"},{"unit":"bag","qty":20,"kg":30,"key":"bag-30","label":"Bag (30 kg)"}] },
  { id:"p-yam-puna", category:"tubers", name:"Puna Yam", unit:"tuber", price:2200, stock:30, img:"yam_puna", desc:"Firm, white Puna yam known for pounding smooth.", measures:[{"unit":"tuber","qty":1,"key":"tuber-1","label":"1 tuber"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 tubers)"},{"unit":"heap","qty":5,"key":"heap-5","label":"Heap (5 tubers)"}] },
  { id:"p-yam-bean", category:"tubers", name:"Yam Bean (Jicama)", unit:"piece", price:500, stock:80, img:"yam_bean", desc:"Crunchy, juicy, lightly sweet jicama root.", measures:[{"unit":"piece","qty":1,"key":"piece-1","label":"1 piece"},{"unit":"heap","qty":4,"key":"heap-4","label":"Heap (4 pieces)"}] },
  { id:"p-cassava-sweet", category:"tubers", name:"Sweet Cassava (Eating Variety)", unit:"heap", price:2000, stock:18, img:"cassava_sweet", desc:"Low-bitterness cassava that can be boiled or fried.", measures:[{"unit":"heap","qty":1,"kg":4,"key":"heap-4","label":"1 heap"},{"unit":"bag","qty":12,"kg":48,"key":"bag-48","label":"Bag (48 kg)"}] },
  { id:"p-yam-aerial", category:"tubers", name:"Aerial Yam", unit:"heap", price:1400, stock:20, img:"yam_aerial", desc:"Small yam-like tubers that grow on the vine, good boiled or roasted.", measures:[{"unit":"heap","qty":1,"kg":1,"key":"heap-1","label":"1 heap"},{"unit":"basin","qty":6,"kg":6,"key":"basin-6","label":"Basin (≈6 kg)"}] },
  { id:"p-maize", category:"grains", name:"Sweet Maize (Corn)", unit:"cob", price:150, stock:5, img:"maize", desc:"Fresh sweet corn on the cob, harvested this morning from the field.", measures:[{"unit":"cob","qty":1,"key":"cob-1","label":"1 cob"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 cobs)"},{"unit":"sack","qty":100,"key":"sack-100","label":"Sack (100 cobs)"}] },
  { id:"p-rice-ofada", category:"grains", name:"Ofada Rice (Local Unpolished)", unit:"kg", price:2800, stock:600, img:"rice_ofada", desc:"Aromatic local ofada rice, stone-free and carefully sorted.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"mudu","qty":1.5,"key":"mudu-1.5","label":"Mudù (≈1.5 kg)"},{"unit":"derica","qty":1.8,"key":"derica-1.8","label":"Derica (≈1.8 kg)"},{"unit":"paint_rubber","qty":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":25,"key":"bag-25","label":"Bag (25 kg)"},{"unit":"bag","qty":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-rice-local", category:"grains", name:"Local Long-Grain Rice", unit:"kg", price:2200, stock:800, img:"rice_local", desc:"Clean local parboiled long-grain rice for jollof and everyday meals.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"mudu","qty":1.5,"key":"mudu-1.5","label":"Mudù (≈1.5 kg)"},{"unit":"derica","qty":1.8,"key":"derica-1.8","label":"Derica (≈1.8 kg)"},{"unit":"paint_rubber","qty":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":25,"key":"bag-25","label":"Bag (25 kg)"},{"unit":"bag","qty":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-maize-white", category:"grains", name:"Dry White Maize", unit:"derica", price:1530, stock:882, img:"maize_white", desc:"Clean, dry white maize grain for pap, milling and feed.", measures:[{"unit":"derica","qty":1,"kg":1.7,"key":"derica-1.7","label":"1 derica"},{"unit":"paint_rubber","qty":2.647,"kg":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":58.824,"kg":100,"key":"bag-100","label":"Bag (100 kg)"},{"unit":"tonne","qty":588.235,"kg":1000,"key":"tonne-1000","label":"1 tonne"}] },
  { id:"p-maize-yellow", category:"grains", name:"Dry Yellow Maize", unit:"derica", price:1440, stock:882, img:"maize_yellow", desc:"Dry yellow maize for grits, milling and animal feed.", measures:[{"unit":"derica","qty":1,"kg":1.7,"key":"derica-1.7","label":"1 derica"},{"unit":"paint_rubber","qty":2.647,"kg":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":58.824,"kg":100,"key":"bag-100","label":"Bag (100 kg)"},{"unit":"tonne","qty":588.235,"kg":1000,"key":"tonne-1000","label":"1 tonne"}] },
  { id:"p-popcorn", category:"grains", name:"Popcorn Kernels", unit:"packet", price:900, stock:400, img:"popcorn", desc:"Pop-ready kernels for a quick, crunchy snack.", measures:[{"unit":"packet","qty":1,"kg":0.5,"key":"packet-0.5","label":"1 packet"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":10,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-sorghum-red", category:"grains", name:"Red Guinea Corn (Sorghum)", unit:"mudu", price:1500, stock:533, img:"sorghum_red", desc:"Red sorghum for pap, kunu and traditional brews.", measures:[{"unit":"mudu","qty":1,"kg":1.5,"key":"mudu-1.5","label":"1 mudù"},{"unit":"paint_rubber","qty":3,"kg":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":66.667,"kg":100,"key":"bag-100","label":"Bag (100 kg)"}] },
  { id:"p-sorghum-white", category:"grains", name:"White Guinea Corn (Sorghum)", unit:"mudu", price:1580, stock:467, img:"sorghum_white", desc:"White sorghum for tuwo, kunu and porridge.", measures:[{"unit":"mudu","qty":1,"kg":1.5,"key":"mudu-1.5","label":"1 mudù"},{"unit":"paint_rubber","qty":3,"kg":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":66.667,"kg":100,"key":"bag-100","label":"Bag (100 kg)"}] },
  { id:"p-millet", category:"grains", name:"Pearl Millet (Jero)", unit:"mudu", price:1650, stock:400, img:"millet", desc:"Nutritious pearl millet for fura, tuwo and porridge.", measures:[{"unit":"mudu","qty":1,"kg":1.5,"key":"mudu-1.5","label":"1 mudù"},{"unit":"paint_rubber","qty":3,"kg":4.5,"key":"paint_rubber-4.5","label":"Paint rubber (≈4.5 kg)"},{"unit":"bag","qty":66.667,"kg":100,"key":"bag-100","label":"Bag (100 kg)"}] },
  { id:"p-acha", category:"grains", name:"Acha (Fonio)", unit:"packet", price:1750, stock:400, img:"acha", desc:"Tiny, quick-cooking fonio grain, a premium traditional cereal.", measures:[{"unit":"packet","qty":1,"kg":0.5,"key":"packet-0.5","label":"1 packet"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":10,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-rice-brown", category:"grains", name:"Brown Rice (Whole Grain)", unit:"kg", price:3000, stock:300, img:"rice_brown", desc:"Whole-grain brown rice, higher in fibre than white rice.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"kg","qty":10,"key":"kg-10","label":"10 kg"},{"unit":"bag","qty":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"p-rice-bag", category:"grains", name:"Local Rice (50kg Bag)", unit:"bag", price:105000, stock:60, img:"rice_bag", desc:"Full 50 kg bag of clean local rice, ideal for homes, events and resale.", measures:[{"unit":"bag","qty":1,"key":"bag-1","label":"1 bag"},{"unit":"tonne","qty":20,"kg":1000,"key":"tonne-1000","label":"1 tonne"}] },
  { id:"p-wheat", category:"grains", name:"Wheat Grain", unit:"kg", price:1300, stock:400, img:"wheat", desc:"Whole wheat grain for milling and baking.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"bag","qty":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-oats", category:"grains", name:"Oats (Whole Grain)", unit:"packet", price:1600, stock:300, img:"oats", desc:"Whole oats for breakfast porridge and baking.", measures:[{"unit":"packet","qty":1,"kg":0.5,"key":"packet-0.5","label":"1 packet"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":10,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-greenbeans", category:"legumes", name:"Green Beans", unit:"heap", price:650, stock:50, img:"greenbeans", desc:"Crisp green beans for fried rice and stir-fry.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"basket","qty":10,"kg":5,"key":"basket-5","label":"Basket (≈5 kg)"}] },
  { id:"p-beans-brown", category:"legumes", name:"Brown Beans (Oloyin)", unit:"derica", price:3360, stock:438, img:"beans_brown", desc:"Sweet, honey-type brown beans for ewa agoyin, moi moi and porridge.", measures:[{"unit":"derica","qty":1,"kg":1.6,"key":"derica-1.6","label":"1 derica"},{"unit":"paint_rubber","qty":2.5,"kg":4,"key":"paint_rubber-4","label":"Paint rubber (≈4 kg)"},{"unit":"bag","qty":31.25,"kg":50,"key":"bag-50","label":"Bag (50 kg)"},{"unit":"sack","qty":62.5,"kg":100,"key":"sack-100","label":"Sack (100 kg)"}] },
  { id:"p-beans-white", category:"legumes", name:"White Beans (Ewa Funfun)", unit:"derica", price:3040, stock:438, img:"beans_white", desc:"Clean white beans for moi moi, akara and beans porridge.", measures:[{"unit":"derica","qty":1,"kg":1.6,"key":"derica-1.6","label":"1 derica"},{"unit":"paint_rubber","qty":2.5,"kg":4,"key":"paint_rubber-4","label":"Paint rubber (≈4 kg)"},{"unit":"bag","qty":31.25,"kg":50,"key":"bag-50","label":"Bag (50 kg)"},{"unit":"sack","qty":62.5,"kg":100,"key":"sack-100","label":"Sack (100 kg)"}] },
  { id:"p-soybeans", category:"legumes", name:"Soybeans", unit:"derica", price:2250, stock:333, img:"soybeans", desc:"Protein-rich soybeans for soy milk, flour and cooking.", measures:[{"unit":"derica","qty":1,"kg":1.5,"key":"derica-1.5","label":"1 derica"},{"unit":"paint_rubber","qty":2.667,"kg":4,"key":"paint_rubber-4","label":"Paint rubber (≈4 kg)"},{"unit":"bag","qty":33.333,"kg":50,"key":"bag-50","label":"Bag (50 kg)"},{"unit":"sack","qty":66.667,"kg":100,"key":"sack-100","label":"Sack (100 kg)"}] },
  { id:"p-groundnut-shelled", category:"legumes", name:"Groundnut (Shelled)", unit:"derica", price:2990, stock:308, img:"groundnut_shelled", desc:"Clean shelled groundnuts for roasting, groundnut oil and sauces.", measures:[{"unit":"derica","qty":1,"kg":1.3,"key":"derica-1.3","label":"1 derica"},{"unit":"paint_rubber","qty":3.077,"kg":4,"key":"paint_rubber-4","label":"Paint rubber (≈4 kg)"},{"unit":"bag","qty":38.462,"kg":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-groundnut-inshell", category:"legumes", name:"Groundnut (In Shell)", unit:"paint_rubber", price:3500, stock:160, img:"groundnut_inshell", desc:"Groundnuts in the shell, fresh and ready to boil or roast.", measures:[{"unit":"paint_rubber","qty":1,"kg":2.5,"key":"paint_rubber-2.5","label":"1 paint rubber"},{"unit":"bag","qty":16,"kg":40,"key":"bag-40","label":"Bag (40 kg)"}] },
  { id:"p-bambara", category:"legumes", name:"Bambara Nut", unit:"mudu", price:3640, stock:143, img:"bambara", desc:"Traditional bambara groundnut for okpa and porridge.", measures:[{"unit":"mudu","qty":1,"kg":1.4,"key":"mudu-1.4","label":"1 mudù"},{"unit":"paint_rubber","qty":2.857,"kg":4,"key":"paint_rubber-4","label":"Paint rubber (≈4 kg)"},{"unit":"bag","qty":35.714,"kg":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-pigeon-pea", category:"legumes", name:"Pigeon Pea (Fiofio)", unit:"derica", price:3000, stock:100, img:"pigeon_pea", desc:"Fiofio pigeon peas for porridge, stews and soups.", measures:[{"unit":"derica","qty":1,"kg":1.5,"key":"derica-1.5","label":"1 derica"},{"unit":"paint_rubber","qty":2.667,"kg":4,"key":"paint_rubber-4","label":"Paint rubber (≈4 kg)"},{"unit":"bag","qty":33.333,"kg":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-sese", category:"legumes", name:"African Yam Bean (Sese)", unit:"packet", price:1600, stock:200, img:"sese", desc:"Rare, protein-rich African yam bean for traditional dishes.", measures:[{"unit":"packet","qty":1,"kg":0.5,"key":"packet-0.5","label":"1 packet"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":10,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-egusi", category:"legumes", name:"Egusi (Melon Seeds)", unit:"derica", price:3600, stock:312, img:"egusi", desc:"Shelled egusi seeds for the classic Nigerian soup.", measures:[{"unit":"tin","qty":0.5,"kg":0.4,"key":"tin-0.4","label":"Tin (≈0.4 kg)"},{"unit":"derica","qty":1,"kg":0.8,"key":"derica-0.8","label":"1 derica"},{"unit":"kg","qty":1.25,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":6.25,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-sesame", category:"legumes", name:"Beniseed (Sesame)", unit:"derica", price:3360, stock:208, img:"sesame", desc:"Clean sesame seeds for toasting, oil and sauces.", measures:[{"unit":"derica","qty":1,"kg":1.2,"key":"derica-1.2","label":"1 derica"},{"unit":"paint_rubber","qty":2.917,"kg":3.5,"key":"paint_rubber-3.5","label":"Paint rubber (≈3.5 kg)"},{"unit":"bag","qty":41.667,"kg":50,"key":"bag-50","label":"Bag (50 kg)"}] },
  { id:"p-sunflower", category:"legumes", name:"Sunflower Seeds", unit:"packet", price:1200, stock:300, img:"sunflower", desc:"Raw sunflower seeds for snacking and oil.", measures:[{"unit":"packet","qty":1,"kg":0.5,"key":"packet-0.5","label":"1 packet"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":10,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-tigernut", category:"fruits", name:"Tiger Nut", unit:"bowl", price:1200, stock:35, img:"tigernut", desc:"Sweet, chewy tiger nuts — snack or make kunun aya.", measures:[{"unit":"bowl","qty":1,"kg":1,"key":"bowl-1","label":"1 bowl"},{"unit":"basin","qty":5,"kg":5,"key":"basin-5","label":"Basin (≈5 kg)"},{"unit":"bag","qty":25,"kg":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"p-pineapple", category:"fruits", name:"Pineapple", unit:"piece", price:1200, stock:80, img:"pineapple", desc:"Sweet, juicy farm pineapple.", measures:[{"unit":"piece","qty":1,"key":"piece-1","label":"1 piece"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 pieces)"}] },
  { id:"p-watermelon", category:"fruits", name:"Watermelon", unit:"piece", price:2500, stock:50, img:"watermelon", desc:"Large, sweet watermelon, great for hot days.", measures:[{"unit":"piece","qty":1,"key":"piece-1","label":"1 piece"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 pieces)"}] },
  { id:"p-orange", category:"fruits", name:"Sweet Oranges", unit:"heap", price:500, stock:300, img:"orange", desc:"Juicy sweet oranges for eating and juice.", measures:[{"unit":"heap","qty":1,"key":"heap-1","label":"1 heap"},{"unit":"basket","qty":40,"key":"basket-40","label":"Basket (40 heaps)"},{"unit":"sack","qty":100,"key":"sack-100","label":"Sack (100 heaps)"}] },
  { id:"p-banana", category:"fruits", name:"Bananas", unit:"hand", price:400, stock:360, img:"banana", desc:"Sweet bananas sold by the bunch.", measures:[{"unit":"hand","qty":1,"key":"hand-1","label":"1 hand"},{"unit":"bunch","qty":6,"key":"bunch-6","label":"Bunch (6 hands)"}] },
  { id:"p-plantain-unripe", category:"fruits", name:"Unripe Plantain", unit:"hand", price:700, stock:280, img:"plantain_unripe", desc:"Firm green plantains for boiling, chips and porridge.", measures:[{"unit":"hand","qty":1,"key":"hand-1","label":"1 hand"},{"unit":"bunch","qty":5,"key":"bunch-5","label":"Bunch (5 hands)"}] },
  { id:"p-plantain-ripe", category:"fruits", name:"Ripe Plantain", unit:"hand", price:750, stock:160, img:"plantain_ripe", desc:"Soft, yellow plantains for dodo (fried plantain) and roasting (boli).", measures:[{"unit":"hand","qty":1,"key":"hand-1","label":"1 hand"},{"unit":"bunch","qty":5,"key":"bunch-5","label":"Bunch (5 hands)"}] },
  { id:"p-pawpaw", category:"fruits", name:"Pawpaw (Papaya)", unit:"piece", price:1000, stock:60, img:"pawpaw", desc:"Sweet, soft pawpaw rich in vitamins.", measures:[{"unit":"piece","qty":1,"key":"piece-1","label":"1 piece"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 pieces)"}] },
  { id:"p-mango", category:"fruits", name:"Mango", unit:"heap", price:600, stock:150, img:"mango", desc:"Sweet, juicy seasonal mangoes.", measures:[{"unit":"heap","qty":1,"key":"heap-1","label":"1 heap"},{"unit":"basket","qty":30,"key":"basket-30","label":"Basket (30 heaps)"}] },
  { id:"p-avocado", category:"fruits", name:"Avocado Pear", unit:"heap", price:800, stock:80, img:"avocado", desc:"Creamy avocado pears for eating, salads and smoothies.", measures:[{"unit":"heap","qty":1,"key":"heap-1","label":"1 heap"},{"unit":"crate","qty":15,"key":"crate-15","label":"Crate (15 heaps)"}] },
  { id:"p-coconut", category:"fruits", name:"Coconut", unit:"piece", price:600, stock:150, img:"coconut", desc:"Fresh coconuts with sweet water and firm flesh.", measures:[{"unit":"piece","qty":1,"key":"piece-1","label":"1 piece"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 pieces)"},{"unit":"bag","qty":25,"key":"bag-25","label":"Bag (25 pieces)"}] },
  { id:"p-cashew", category:"fruits", name:"Cashew Nuts (Raw, Shelled)", unit:"packet", price:1880, stock:320, img:"cashew", desc:"Shelled raw cashew nuts, a premium snack and cooking nut.", measures:[{"unit":"packet","qty":1,"kg":0.25,"key":"packet-0.25","label":"1 packet"},{"unit":"kg","qty":4,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":20,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-kolanut", category:"fruits", name:"Kola Nut", unit:"bowl", price:1500, stock:120, img:"kolanut", desc:"Traditional kola nuts for ceremonies and chewing.", measures:[{"unit":"bowl","qty":1,"kg":0.5,"key":"bowl-0.5","label":"1 bowl"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"basket","qty":20,"kg":10,"key":"basket-10","label":"Basket (≈10 kg)"}] },
  { id:"p-tomato", category:"vegetables", name:"Ripe Tomatoes", unit:"heap", price:490, stock:200, img:"tomato", desc:"Plump, vine-ripened tomatoes. Perfect for stews, sauces and soups.", measures:[{"unit":"heap","qty":1,"kg":0.7,"key":"heap-0.7","label":"1 heap"},{"unit":"bowl","qty":3.571,"kg":2.5,"key":"bowl-2.5","label":"Bowl (≈2.5 kg)"},{"unit":"basket","qty":35.714,"kg":25,"key":"basket-25","label":"Basket (≈25 kg)"}] },
  { id:"p-pumpkin", category:"vegetables", name:"Farm Pumpkin", unit:"piece", price:1800, stock:40, img:"pumpkin", desc:"Large, fresh pumpkin — ideal for porridge, soups and seeds." },
  { id:"p-cucumber", category:"vegetables", name:"Green Cucumbers", unit:"heap", price:600, stock:100, img:"cucumber", desc:"Crisp, field-grown cucumbers — great fresh, in salads, or juiced.", measures:[{"unit":"heap","qty":1,"key":"heap-1","label":"1 heap"},{"unit":"basket","qty":25,"key":"basket-25","label":"Basket (25 heaps)"}] },
  { id:"p-ugu", category:"vegetables", name:"Fluted Pumpkin Leaf (Ugu)", unit:"bunch", price:400, stock:60, img:"ugu", desc:"Fresh ugu leaves for efo riro, egusi and vegetable soup.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-efo-tete", category:"vegetables", name:"Efo Tete (Green Amaranth)", unit:"bunch", price:300, stock:60, img:"efo_tete", desc:"Tender green amaranth leaves, a Yoruba soup staple.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-efo-shoko", category:"vegetables", name:"Efo Shoko (Celosia)", unit:"bunch", price:300, stock:50, img:"efo_shoko", desc:"Soft celosia leaves, lovely cooked in stew or with palm oil.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-ewedu", category:"vegetables", name:"Ewedu (Jute Leaf)", unit:"bunch", price:250, stock:50, img:"ewedu", desc:"Fresh jute leaves for smooth, slippery ewedu soup.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-waterleaf", category:"vegetables", name:"Waterleaf", unit:"bunch", price:300, stock:60, img:"waterleaf", desc:"Juicy waterleaf for edikang ikong, afang and everyday soups.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-bitterleaf", category:"vegetables", name:"Bitter Leaf", unit:"bunch", price:350, stock:45, img:"bitterleaf", desc:"Washed, ready-to-use bitter leaf for ofe onugbu and soups.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-okra", category:"vegetables", name:"Okra", unit:"heap", price:450, stock:100, img:"okra", desc:"Young, tender okra pods — perfect for draw soup.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"bowl","qty":4,"kg":2,"key":"bowl-2","label":"Bowl (≈2 kg)"},{"unit":"basket","qty":30,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"}] },
  { id:"p-gardenegg", category:"vegetables", name:"Garden Egg", unit:"heap", price:400, stock:80, img:"gardenegg", desc:"Fresh garden eggs, eaten raw with groundnut or cooked in sauces.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"bowl","qty":4,"kg":2,"key":"bowl-2","label":"Bowl (≈2 kg)"},{"unit":"basket","qty":20,"kg":10,"key":"basket-10","label":"Basket (≈10 kg)"}] },
  { id:"p-onion", category:"vegetables", name:"Onions", unit:"heap", price:550, stock:140, img:"onion", desc:"Firm, well-cured onions for everyday cooking.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"basin","qty":20,"kg":10,"key":"basin-10","label":"Basin (≈10 kg)"},{"unit":"sack","qty":200,"kg":100,"key":"sack-100","label":"Sack (100 kg)"}] },
  { id:"p-carrot", category:"vegetables", name:"Carrots", unit:"heap", price:500, stock:80, img:"carrot", desc:"Sweet, crunchy carrots for salads, rice and juice.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"basket","qty":30,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"}] },
  { id:"p-cabbage", category:"vegetables", name:"Cabbage", unit:"head", price:700, stock:35, img:"cabbage", desc:"Fresh, tight green cabbage heads for salads and stir-fry.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 heads)"}] },
  { id:"p-lettuce", category:"vegetables", name:"Lettuce", unit:"head", price:600, stock:30, img:"lettuce", desc:"Crunchy lettuce heads for salads and sandwiches.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 heads)"}] },
  { id:"p-spinach", category:"vegetables", name:"Spinach", unit:"bunch", price:400, stock:40, img:"spinach", desc:"Fresh spinach leaves, perfect for soups and smoothies.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-oha", category:"vegetables", name:"Oha Leaf", unit:"bunch", price:600, stock:40, img:"oha", desc:"Tender oha leaves for the famous oha soup.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-afang", category:"vegetables", name:"Afang Leaf (Okazi)", unit:"bunch", price:700, stock:35, img:"afang", desc:"Shredded-ready afang leaf for afang soup.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-cauliflower", category:"vegetables", name:"Cauliflower", unit:"head", price:1500, stock:25, img:"cauliflower", desc:"Firm, white cauliflower heads.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 heads)"}] },
  { id:"p-broccoli", category:"vegetables", name:"Broccoli", unit:"head", price:1800, stock:20, img:"broccoli", desc:"Fresh green broccoli for stir-fries and rice.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"dozen","qty":12,"key":"dozen-12","label":"Dozen (12 heads)"}] },
  { id:"p-bellpepper-green", category:"vegetables", name:"Green Bell Pepper", unit:"heap", price:600, stock:70, img:"bellpepper_green", desc:"Crisp green bell peppers for fried rice, salads and sauces.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"bowl","qty":4,"kg":2,"key":"bowl-2","label":"Bowl (≈2 kg)"},{"unit":"basket","qty":20,"kg":10,"key":"basket-10","label":"Basket (≈10 kg)"}] },
  { id:"p-spring-onion", category:"vegetables", name:"Spring Onions", unit:"bunch", price:400, stock:50, img:"spring_onion", desc:"Fresh spring onions for garnish, fried rice and stir-fry.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":6,"key":"bundle-6","label":"Bundle (6 bunches)"}] },
  { id:"p-celery", category:"vegetables", name:"Celery", unit:"bunch", price:700, stock:30, img:"celery", desc:"Crisp celery stalks for soups, salads and rice dishes.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-pepper", category:"spices", name:"Fresh Pepper (Tatashe & Rodo Mix)", unit:"bowl", price:850, stock:60, img:"pepper", desc:"Freshly harvested Tatashe and Rodo pepper blend, sorted and ready for stews.", measures:[{"unit":"heap","qty":0.25,"kg":0.25,"key":"heap-0.25","label":"Heap (≈0.25 kg)"},{"unit":"bowl","qty":1,"kg":1,"key":"bowl-1","label":"1 bowl"},{"unit":"basket","qty":15,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"}] },
  { id:"p-pepper-rodo", category:"spices", name:"Ata Rodo (Scotch Bonnet)", unit:"bowl", price:1500, stock:40, img:"pepper_rodo", desc:"Fiery, fruity scotch bonnet — the classic Nigerian hot pepper.", measures:[{"unit":"heap","qty":0.25,"kg":0.25,"key":"heap-0.25","label":"Heap (≈0.25 kg)"},{"unit":"bowl","qty":1,"kg":1,"key":"bowl-1","label":"1 bowl"},{"unit":"basket","qty":15,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"}] },
  { id:"p-pepper-tatashe", category:"spices", name:"Tatashe (Red Bell Pepper)", unit:"bowl", price:1100, stock:45, img:"pepper_tatashe", desc:"Large, mild red peppers that give stews their deep colour.", measures:[{"unit":"heap","qty":0.25,"kg":0.25,"key":"heap-0.25","label":"Heap (≈0.25 kg)"},{"unit":"bowl","qty":1,"kg":1,"key":"bowl-1","label":"1 bowl"},{"unit":"basket","qty":15,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"}] },
  { id:"p-pepper-shombo", category:"spices", name:"Shombo (Long Cayenne Pepper)", unit:"bowl", price:900, stock:50, img:"pepper_shombo", desc:"Long, medium-hot cayenne pepper, great fresh or dried.", measures:[{"unit":"heap","qty":0.25,"kg":0.25,"key":"heap-0.25","label":"Heap (≈0.25 kg)"},{"unit":"bowl","qty":1,"kg":1,"key":"bowl-1","label":"1 bowl"},{"unit":"basket","qty":15,"kg":15,"key":"basket-15","label":"Basket (≈15 kg)"}] },
  { id:"p-pepper-wewe", category:"spices", name:"Ata Wewe (Small Hot Chilli)", unit:"heap", price:260, stock:150, img:"pepper_wewe", desc:"Tiny, very hot chillies for pepper soup and sauces.", measures:[{"unit":"heap","qty":1,"kg":0.2,"key":"heap-0.2","label":"1 heap"},{"unit":"bowl","qty":5,"kg":1,"key":"bowl-1","label":"Bowl (≈1 kg)"},{"unit":"basket","qty":50,"kg":10,"key":"basket-10","label":"Basket (≈10 kg)"}] },
  { id:"p-pepper-cameroon", category:"spices", name:"Cameroon Pepper (Ata Ijosi)", unit:"tin", price:490, stock:71, img:"pepper_cameroon", desc:"Small, aromatic and very hot — a favourite for dry pepper.", measures:[{"unit":"tin","qty":1,"kg":0.35,"key":"tin-0.35","label":"1 tin"},{"unit":"kg","qty":2.857,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-scentleaf", category:"spices", name:"Scent Leaf (Efirin)", unit:"bunch", price:250, stock:45, img:"scentleaf", desc:"Aromatic scent leaf for pepper soup and stews.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-ginger", category:"spices", name:"Fresh Ginger", unit:"heap", price:900, stock:60, img:"ginger", desc:"Spicy fresh ginger roots for tea, cooking and drinks.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"basin","qty":16,"kg":8,"key":"basin-8","label":"Basin (≈8 kg)"}] },
  { id:"p-turmeric", category:"spices", name:"Fresh Turmeric", unit:"heap", price:1000, stock:40, img:"turmeric", desc:"Fresh turmeric roots for cooking, tea and wellness drinks.", measures:[{"unit":"heap","qty":1,"kg":0.5,"key":"heap-0.5","label":"1 heap"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"basin","qty":16,"kg":8,"key":"basin-8","label":"Basin (≈8 kg)"}] },
  { id:"p-garlic", category:"spices", name:"Garlic", unit:"heap", price:1120, stock:240, img:"garlic", desc:"Firm, aromatic garlic bulbs.", measures:[{"unit":"heap","qty":1,"kg":0.25,"key":"heap-0.25","label":"1 heap"},{"unit":"kg","qty":4,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"sack","qty":160,"kg":40,"key":"sack-40","label":"Sack (40 kg)"}] },
  { id:"p-uziza-leaf", category:"spices", name:"Uziza Leaf", unit:"bunch", price:300, stock:50, img:"uziza_leaf", desc:"Peppery uziza leaves for soups and pepper soup.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-uziza-seed", category:"spices", name:"Uziza Seeds", unit:"packet", price:900, stock:300, img:"uziza_seed", desc:"Dried uziza seeds, a hot, aromatic seasoning.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-utazi", category:"spices", name:"Utazi Leaf", unit:"bunch", price:350, stock:40, img:"utazi", desc:"Bitter-sweet utazi leaf for soups and traditional dishes.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-lemongrass", category:"spices", name:"Lemongrass (Fresh)", unit:"bunch", price:300, stock:45, img:"lemongrass", desc:"Fragrant lemongrass stalks for tea and soups.", measures:[{"unit":"bunch","qty":1,"key":"bunch-1","label":"1 bunch"},{"unit":"bundle","qty":5,"key":"bundle-5","label":"Bundle (5 bunches)"}] },
  { id:"p-cloves", category:"spices", name:"Cloves (Dried)", unit:"packet", price:1400, stock:250, img:"cloves", desc:"Whole dried cloves, a strong aromatic spice.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-ehuru", category:"spices", name:"Calabash Nutmeg (Ehuru)", unit:"packet", price:1600, stock:200, img:"ehuru", desc:"Ehuru, the fragrant calabash nutmeg used in pepper soup.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-atare", category:"spices", name:"Alligator Pepper (Atare)", unit:"packet", price:1800, stock:150, img:"atare", desc:"Atare seeds used in traditional ceremonies and spice blends.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-uda", category:"spices", name:"Grains of Selim (Uda)", unit:"packet", price:1300, stock:200, img:"uda", desc:"Smoky, aromatic uda pods for pepper soup and stews.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-thyme", category:"spices", name:"Thyme (Dried)", unit:"packet", price:900, stock:250, img:"thyme", desc:"Dried thyme for stews, jollof and meat.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"sachet","qty":0.25,"kg":0.025,"key":"sachet-0.03","label":"Sachet (0.03 kg)"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-bayleaf", category:"spices", name:"Bay Leaves (Dried)", unit:"packet", price:800, stock:250, img:"bayleaf", desc:"Dried bay leaves for rice, stews and soups.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"sachet","qty":0.25,"kg":0.025,"key":"sachet-0.03","label":"Sachet (0.03 kg)"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-blackpepper", category:"spices", name:"Black Pepper (Peppercorns)", unit:"packet", price:1200, stock:300, img:"blackpepper", desc:"Whole black peppercorns with a sharp, warm bite.", measures:[{"unit":"packet","qty":1,"kg":0.1,"key":"packet-0.1","label":"1 packet"},{"unit":"sachet","qty":0.25,"kg":0.025,"key":"sachet-0.03","label":"Sachet (0.03 kg)"},{"unit":"g","qty":2.5,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"g","qty":5,"kg":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":10,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-garri-white", category:"processed", name:"Garri (White)", unit:"derica", price:1100, stock:455, img:"garri_white", desc:"Crisp, well-fried white garri — fine, clean and sour-free.", measures:[{"unit":"derica","qty":1,"kg":1.1,"key":"derica-1.1","label":"1 derica"},{"unit":"paint_rubber","qty":3,"kg":3.3,"key":"paint_rubber-3.3","label":"Paint rubber (≈3.3 kg)"},{"unit":"bag","qty":22.727,"kg":25,"key":"bag-25","label":"Bag (25 kg)"},{"unit":"sack","qty":45.455,"kg":50,"key":"sack-50","label":"Sack (50 kg)"}] },
  { id:"p-garri-yellow", category:"processed", name:"Garri (Yellow)", unit:"derica", price:1320, stock:455, img:"garri_yellow", desc:"Palm-oil yellow garri with a rich colour and taste.", measures:[{"unit":"derica","qty":1,"kg":1.1,"key":"derica-1.1","label":"1 derica"},{"unit":"paint_rubber","qty":3,"kg":3.3,"key":"paint_rubber-3.3","label":"Paint rubber (≈3.3 kg)"},{"unit":"bag","qty":22.727,"kg":25,"key":"bag-25","label":"Bag (25 kg)"},{"unit":"sack","qty":45.455,"kg":50,"key":"sack-50","label":"Sack (50 kg)"}] },
  { id:"p-lafun", category:"processed", name:"Cassava Flour (Lafun)", unit:"derica", price:1300, stock:300, img:"lafun", desc:"Smooth, fine lafun for a soft, stretchy amala.", measures:[{"unit":"derica","qty":1,"kg":1,"key":"derica-1","label":"1 derica"},{"unit":"kg","qty":5,"kg":5,"key":"kg-5","label":"5 kg"},{"unit":"bag","qty":25,"kg":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"p-fufu", category:"processed", name:"Fufu Flour", unit:"derica", price:1400, stock:300, img:"fufu_flour", desc:"Quick-mix cassava fufu flour — just add hot water.", measures:[{"unit":"derica","qty":1,"kg":1,"key":"derica-1","label":"1 derica"},{"unit":"kg","qty":5,"kg":5,"key":"kg-5","label":"5 kg"},{"unit":"bag","qty":25,"kg":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"p-palm-oil", category:"processed", name:"Red Palm Oil (1 Litre)", unit:"litre", price:2800, stock:300, img:"palm_oil", desc:"Pure, unbleached red palm oil for stews, banga and ofada sauce.", measures:[{"unit":"ml","qty":0.5,"key":"ml-0.5","label":"500 mL"},{"unit":"litre","qty":1,"key":"litre-1","label":"1 litre"},{"unit":"bottle","qty":0.75,"key":"bottle-0.75","label":"Bottle (0.75 litres)"},{"unit":"jerrycan","qty":5,"key":"jerrycan-5","label":"Jerrycan (5 litres)"},{"unit":"jerrycan","qty":25,"key":"jerrycan-25","label":"Jerrycan (25 litres)"}] },
  { id:"p-groundnut-oil", category:"processed", name:"Groundnut Oil (1 Litre)", unit:"litre", price:4200, stock:200, img:"groundnut_oil", desc:"Golden groundnut oil for frying and cooking.", measures:[{"unit":"ml","qty":0.5,"key":"ml-0.5","label":"500 mL"},{"unit":"litre","qty":1,"key":"litre-1","label":"1 litre"},{"unit":"bottle","qty":0.75,"key":"bottle-0.75","label":"Bottle (0.75 litres)"},{"unit":"jerrycan","qty":5,"key":"jerrycan-5","label":"Jerrycan (5 litres)"},{"unit":"jerrycan","qty":25,"key":"jerrycan-25","label":"Jerrycan (25 litres)"}] },
  { id:"p-yam-flour", category:"processed", name:"Yam Flour (Elubo)", unit:"derica", price:1620, stock:278, img:"yam_flour", desc:"Dried yam flour for smooth amala isu.", measures:[{"unit":"derica","qty":1,"kg":0.9,"key":"derica-0.9","label":"1 derica"},{"unit":"kg","qty":5.556,"kg":5,"key":"kg-5","label":"5 kg"},{"unit":"bag","qty":27.778,"kg":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"p-plantain-flour", category:"processed", name:"Plantain Flour", unit:"packet", price:1100, stock:300, img:"plantain_flour", desc:"Unripe plantain flour for a soft, healthy swallow.", measures:[{"unit":"packet","qty":1,"kg":0.5,"key":"packet-0.5","label":"1 packet"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":10,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-tapioca", category:"processed", name:"Tapioca", unit:"derica", price:1600, stock:200, img:"tapioca", desc:"Dried tapioca pearls for pudding and sweet desserts.", measures:[{"unit":"derica","qty":1,"kg":1,"key":"derica-1","label":"1 derica"},{"unit":"kg","qty":5,"kg":5,"key":"kg-5","label":"5 kg"},{"unit":"carton","qty":10,"kg":10,"key":"carton-10","label":"Carton (10 kg)"}] },
  { id:"p-iru", category:"processed", name:"Locust Beans (Iru)", unit:"tin", price:2400, stock:200, img:"iru", desc:"Fermented locust beans, the savoury seasoning for soups and stews.", measures:[{"unit":"tin","qty":1,"kg":0.4,"key":"tin-0.4","label":"1 tin"},{"unit":"kg","qty":2.5,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"p-ogbono", category:"processed", name:"Ogbono (Dried Seeds)", unit:"tin", price:3800, stock:250, img:"ogbono", desc:"Dried ogbono (wild mango) seeds for draw soup.", measures:[{"unit":"tin","qty":1,"kg":0.4,"key":"tin-0.4","label":"1 tin"},{"unit":"kg","qty":2.5,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":12.5,"kg":5,"key":"kg-5","label":"5 kg"}] },
  { id:"p-kulikuli", category:"processed", name:"Kuli-Kuli (Groundnut Cake)", unit:"bowl", price:1750, stock:240, img:"kulikuli", desc:"Crunchy kuli-kuli, a classic groundnut snack.", measures:[{"unit":"bowl","qty":1,"kg":0.5,"key":"bowl-0.5","label":"1 bowl"},{"unit":"kg","qty":2,"kg":1,"key":"kg-1","label":"1 kg"},{"unit":"bag","qty":50,"kg":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"p-wara", category:"processed", name:"Wara (Local Cheese)", unit:"pack", price:2000, stock:70, img:"wara", desc:"Soft, fresh Nigerian cheese made from cow milk.", measures:[{"unit":"pack","qty":1,"key":"pack-1","label":"1 pack"},{"unit":"bowl","qty":6,"key":"bowl-6","label":"Bowl (6 packs)"}] },
];

const LIVESTOCK = [
  { id:"l-pig-lw", category:"livestock", name:"Large White Pig (Live)", unit:"kg", price:2300, stock:400, img:"pig_mature", desc:"Fast-growing Large White breed, vet-checked. Sold live by weight.", measures:[{"unit":"kg","qty":20,"key":"kg-20","label":"20 kg"},{"unit":"kg","qty":40,"key":"kg-40","label":"40 kg"},{"unit":"kg","qty":60,"key":"kg-60","label":"60 kg"},{"unit":"kg","qty":80,"key":"kg-80","label":"80 kg"}] },
  { id:"l-pig-landrace", category:"livestock", name:"Landrace Pig (Live)", unit:"kg", price:2300, stock:300, img:"pig_landrace", desc:"Long-bodied Landrace breed, good meat yield. Sold live by weight.", measures:[{"unit":"kg","qty":20,"key":"kg-20","label":"20 kg"},{"unit":"kg","qty":40,"key":"kg-40","label":"40 kg"},{"unit":"kg","qty":60,"key":"kg-60","label":"60 kg"},{"unit":"kg","qty":80,"key":"kg-80","label":"80 kg"}] },
  { id:"l-pig-duroc", category:"livestock", name:"Duroc Pig (Live)", unit:"kg", price:2400, stock:250, img:"pig_duroc", desc:"Hardy red Duroc breed with well-marbled meat. Sold live by weight.", measures:[{"unit":"kg","qty":20,"key":"kg-20","label":"20 kg"},{"unit":"kg","qty":40,"key":"kg-40","label":"40 kg"},{"unit":"kg","qty":60,"key":"kg-60","label":"60 kg"},{"unit":"kg","qty":80,"key":"kg-80","label":"80 kg"}] },
  { id:"l-pork", category:"livestock", name:"Fresh Pork (Dressed)", unit:"kg", price:3000, stock:150, img:"pork", desc:"Cleaned, dressed pork sold by the kilo, ready for the kitchen.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"carcass","qty":60,"key":"carcass-60","label":"Carcass (60 kg)"}] },
  { id:"l-pig2", category:"livestock", name:"Weaner Pig", unit:"head", price:32000, stock:14, img:"pig_weaner", desc:"Recently weaned pig, active and feeding well — ready to grow out on your farm.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 heads)"}] },
  { id:"l-cow-wf", category:"livestock", name:"White Fulani (Bunaji) Cattle", unit:"head", price:650000, stock:5, img:"cow_white_fulani", desc:"Gentle, dual-purpose White Fulani — good for milk and beef.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"herd","qty":10,"key":"herd-10","label":"Herd (10 heads)"}] },
  { id:"l-cow-rb", category:"livestock", name:"Red Bororo (Rahaji) Cattle", unit:"head", price:600000, stock:5, img:"cow_red_bororo", desc:"Hardy, long-horned Red Bororo — strong and heat-tolerant.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"herd","qty":10,"key":"herd-10","label":"Herd (10 heads)"}] },
  { id:"l-cow-sg", category:"livestock", name:"Sokoto Gudali Cattle", unit:"head", price:700000, stock:4, img:"cow_sokoto_gudali", desc:"Large, muscular Sokoto Gudali — a top beef breed.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"herd","qty":10,"key":"herd-10","label":"Herd (10 heads)"}] },
  { id:"l-goat", category:"livestock", name:"Goat (Live)", unit:"head", price:85000, stock:25, img:"goat", desc:"Healthy West African Dwarf goats, good for meat and breeding.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 heads)"},{"unit":"herd","qty":10,"key":"herd-10","label":"Herd (10 heads)"}] },
  { id:"l-sheep", category:"livestock", name:"Yankasa Sheep (Live)", unit:"head", price:95000, stock:20, img:"sheep", desc:"Hardy Yankasa sheep, a popular meat breed.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 heads)"},{"unit":"flock","qty":10,"key":"flock-10","label":"Flock (10 heads)"}] },
  { id:"l-ram", category:"livestock", name:"Sallah Ram (Large)", unit:"head", price:220000, stock:8, img:"ram", desc:"Large, well-fed rams, popular for festivals and ceremonies.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 heads)"}] },
  { id:"l-rabbit", category:"livestock", name:"Rabbit (Live)", unit:"head", price:8500, stock:40, img:"rabbit", desc:"Healthy rabbits for meat or breeding.", measures:[{"unit":"head","qty":1,"key":"head-1","label":"1 head"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 heads)"}] },
  { id:"l-beef", category:"livestock", name:"Fresh Beef", unit:"kg", price:4200, stock:120, img:"beef", desc:"Freshly butchered beef cuts, hygienically packed.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"kg","qty":10,"key":"kg-10","label":"10 kg"}] },
  { id:"l-goatmeat", category:"livestock", name:"Goat Meat (Fresh)", unit:"kg", price:5200, stock:60, img:"goatmeat", desc:"Fresh goat meat for pepper soup, suya and stews.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"}] },
  { id:"l-honey", category:"livestock", name:"Raw Honey (1 Litre)", unit:"litre", price:7500, stock:70, img:"honey", desc:"Pure, unprocessed forest honey.", measures:[{"unit":"ml","qty":0.5,"key":"ml-0.5","label":"500 mL"},{"unit":"litre","qty":1,"key":"litre-1","label":"1 litre"},{"unit":"bottle","qty":0.75,"key":"bottle-0.75","label":"Bottle (0.75 litres)"},{"unit":"jerrycan","qty":5,"key":"jerrycan-5","label":"Jerrycan (5 litres)"}] },
  { id:"l-milk", category:"livestock", name:"Fresh Cow Milk", unit:"litre", price:1500, stock:80, img:"milk", desc:"Fresh farm cow milk, delivered chilled.", measures:[{"unit":"ml","qty":0.5,"key":"ml-0.5","label":"500 mL"},{"unit":"litre","qty":1,"key":"litre-1","label":"1 litre"},{"unit":"jerrycan","qty":5,"key":"jerrycan-5","label":"Jerrycan (5 litres)"},{"unit":"bucket","qty":10,"key":"bucket-10","label":"Bucket (10 litres)"}] },
  { id:"l-snail", category:"livestock", name:"Giant African Snails (Live)", unit:"dozen", price:6000, stock:50, img:"snail", desc:"Large, live giant African land snails.", measures:[{"unit":"dozen","qty":1,"key":"dozen-1","label":"1 dozen"},{"unit":"basin","qty":6,"key":"basin-6","label":"Basin (6 dozens)"}] },
  { id:"l-eggs", category:"poultry", name:"Fresh Eggs (Crate of 30)", unit:"crate", price:4800, stock:40, img:"eggs", desc:"Farm-fresh table eggs, collected daily and sold by the crate of 30.", measures:[{"unit":"crate","qty":1,"key":"crate-1","label":"1 crate"},{"unit":"dozen","qty":0.4,"label":"Dozen (12 eggs)","key":"dozen-0.4"},{"unit":"carton","qty":12,"label":"Carton (12 crates)","key":"carton-12"}] },
  { id:"l-broiler", category:"poultry", name:"Table-Ready Broiler", unit:"kg", price:1500, stock:120, img:"broiler", desc:"Vet-cleared broilers, sold live or dressed (processed) by the kilo.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":2,"key":"kg-2","label":"2 kg"},{"unit":"kg","qty":3,"key":"kg-3","label":"3 kg"}], modes:{"live":1500,"processed":2000} },
  { id:"l-broiler2", category:"poultry", name:"Broiler Chicks (8wks)", unit:"bird", price:1800, stock:3, img:"broiler_svg", desc:"8-week-old broiler chicks, vaccinated, ready for finishing to table weight.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"carton","qty":100,"key":"carton-100","label":"Carton (100 birds)"},{"unit":"flock","qty":500,"key":"flock-500","label":"Flock (500 birds)"}] },
  { id:"l-layer", category:"poultry", name:"Point-of-Lay Layer Hen", unit:"bird", price:6500, stock:120, img:"layer", desc:"Young laying hens about to start production.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"flock","qty":50,"key":"flock-50","label":"Flock (50 birds)"}] },
  { id:"l-local-chicken", category:"poultry", name:"Local Free-Range Chicken (Live)", unit:"bird", price:9000, stock:60, img:"local_chicken", desc:"Free-range local chicken with firm, flavourful meat.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 birds)"}] },
  { id:"l-cockerel", category:"poultry", name:"Cockerel (Live)", unit:"bird", price:8500, stock:50, img:"cockerel", desc:"Healthy live cockerels for the pot or for rearing.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 birds)"},{"unit":"flock","qty":20,"key":"flock-20","label":"Flock (20 birds)"}] },
  { id:"l-turkey", category:"poultry", name:"Turkey (Live)", unit:"bird", price:38000, stock:20, img:"turkey", desc:"Well-fed live turkeys for festive occasions.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 birds)"}] },
  { id:"l-duck", category:"poultry", name:"Duck (Live)", unit:"bird", price:12000, stock:25, img:"duck", desc:"Healthy live ducks for meat and rearing.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 birds)"},{"unit":"flock","qty":20,"key":"flock-20","label":"Flock (20 birds)"}] },
  { id:"l-guinea-fowl", category:"poultry", name:"Guinea Fowl (Live)", unit:"bird", price:11000, stock:30, img:"guinea_fowl", desc:"Live guinea fowl, a lean, flavourful local bird.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"pair","qty":2,"key":"pair-2","label":"Pair (2 birds)"},{"unit":"flock","qty":20,"key":"flock-20","label":"Flock (20 birds)"}] },
  { id:"l-quail-eggs", category:"poultry", name:"Quail Eggs (Tray of 30)", unit:"tray", price:3000, stock:60, img:"quail_eggs", desc:"Small, rich quail eggs sold by the tray of 30.", measures:[{"unit":"tray","qty":1,"key":"tray-1","label":"1 tray"},{"unit":"carton","qty":12,"key":"carton-12","label":"Carton (12 trays)"}] },
  { id:"l-doc", category:"poultry", name:"Day-Old Chicks", unit:"bird", price:850, stock:500, img:"doc", desc:"Vaccinated day-old chicks for starting your own flock.", measures:[{"unit":"bird","qty":1,"key":"bird-1","label":"1 bird"},{"unit":"carton","qty":100,"key":"carton-100","label":"Carton (100 birds)"},{"unit":"flock","qty":500,"key":"flock-500","label":"Flock (500 birds)"}] },
  { id:"l-chicken-parts", category:"poultry", name:"Chicken Parts (Drumsticks & Thighs)", unit:"kg", price:3200, stock:90, img:"chicken_parts", desc:"Cleaned, packed chicken drumsticks and thighs.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"carton","qty":10,"key":"carton-10","label":"Carton (10 kg)"}] },
  { id:"l-catfish-live", category:"fish", name:"Live Catfish", unit:"kg", price:3200, stock:150, img:"catfish_live", desc:"Live pond-raised catfish, sold by weight.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"kg","qty":10,"key":"kg-10","label":"10 kg"}] },
  { id:"l-catfish-smoked", category:"fish", name:"Smoked Catfish", unit:"kg", price:6500, stock:80, img:"catfish_smoked", desc:"Hot-smoked catfish for soups and stews.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"kg","qty":10,"key":"kg-10","label":"10 kg"}] },
  { id:"l-tilapia-fresh", category:"fish", name:"Fresh Tilapia", unit:"kg", price:3000, stock:100, img:"tilapia_fresh", desc:"Fresh pond tilapia, cleaned on request.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"kg","qty":10,"key":"kg-10","label":"10 kg"}] },
  { id:"l-tilapia-smoked", category:"fish", name:"Smoked Tilapia", unit:"kg", price:5500, stock:60, img:"tilapia_smoked", desc:"Smoked tilapia for soups and stews.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"kg","qty":10,"key":"kg-10","label":"10 kg"}] },
  { id:"l-titus", category:"fish", name:"Frozen Titus (Mackerel)", unit:"kg", price:3800, stock:120, img:"titus", desc:"Frozen titus mackerel, a popular affordable fish.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"carton","qty":10,"key":"carton-10","label":"Carton (10 kg)"}] },
  { id:"l-croaker", category:"fish", name:"Croaker Fish (Frozen)", unit:"kg", price:4500, stock:80, img:"croaker", desc:"Frozen croaker fish for stews and frying.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"carton","qty":10,"key":"carton-10","label":"Carton (10 kg)"}] },
  { id:"l-stockfish", category:"fish", name:"Stockfish (Okporoko)", unit:"kg", price:12000, stock:50, img:"stockfish", desc:"Dried stockfish for egusi, afang and ogbono soups.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"bale","qty":25,"key":"bale-25","label":"Bale (≈25 kg)"}] },
  { id:"l-bonga", category:"fish", name:"Smoked Bonga Fish (Shawa)", unit:"kg", price:3500, stock:90, img:"bonga", desc:"Smoky bonga fish for soups and stews.", measures:[{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"},{"unit":"bag","qty":25,"key":"bag-25","label":"Bag (25 kg)"}] },
  { id:"l-crayfish", category:"fish", name:"Dried Crayfish (Whole)", unit:"tin", price:6000, stock:150, img:"crayfish", desc:"Dried crayfish, the essential Nigerian soup flavour.", measures:[{"unit":"g","qty":0.25,"kg":0.1,"key":"g-0.1","label":"100 g"},{"unit":"g","qty":0.625,"kg":0.25,"key":"g-0.25","label":"250 g"},{"unit":"tin","qty":1,"kg":0.4,"key":"tin-0.4","label":"1 tin"},{"unit":"kg","qty":2.5,"kg":1,"key":"kg-1","label":"1 kg"}] },
  { id:"l-prawns", category:"fish", name:"Fresh Prawns", unit:"kg", price:7500, stock:40, img:"prawns", desc:"Fresh prawns, cleaned and chilled.", measures:[{"unit":"g","qty":0.5,"key":"g-0.5","label":"500 g"},{"unit":"kg","qty":1,"key":"kg-1","label":"1 kg"},{"unit":"kg","qty":5,"key":"kg-5","label":"5 kg"}] },
  { id:"l-fingerlings", category:"fish", name:"Catfish Fingerlings", unit:"fingerling", price:120, stock:4000, img:"fingerlings", desc:"Healthy catfish fingerlings for pond stocking, sold per fingerling, per pack of 100 or per pond lot.", measures:[{"unit":"fingerling","qty":1,"key":"fingerling-1","label":"1 fingerling"},{"unit":"pack","qty":100,"key":"pack-100","label":"Pack (100 fingerlings)"},{"unit":"tank","qty":500,"key":"tank-500","label":"Tank (500 fingerlings)"},{"unit":"pond","qty":2000,"key":"pond-2000","label":"Pond (2000 fingerlings)"}] },
];

/* ──────────────────────────────────────────────────────────────
   2. APP STATE
────────────────────────────────────────────────────────────── */
let cart        = [];        // [{ id, kind, qty }]
let currentUser = null;      // { name, email } | null
let pFilter     = 'all';
let lFilter     = 'all';
let searchTerm  = '';

const FEE      = 0.05;
let   DELIVERY = 1500;       // base (Ekiti) delivery fee — the server can change it
let   SERVER   = false;      // true when server.js answers; then data comes from the database
const TOKEN_KEY = 'bm_token';

// Where we deliver (Ekiti + neighbouring states). server.js sends the real fees when it is running.
let DELIVERY_STATES = [
  { name:'Ekiti', fee:1500 }, { name:'Osun', fee:3000 }, { name:'Ondo', fee:3000 }, { name:'Kwara', fee:3000 },
  { name:'Kogi', fee:3000 }, { name:'Edo', fee:3750 }, { name:'Ogun', fee:3750 }
];
function deliveryFor(state){
  const found = DELIVERY_STATES.find(x => x.name === state);
  return found ? found.fee : DELIVERY;
}

/* ──────────────────────────────────────────────────────────────
   3. HELPERS
────────────────────────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function naira(n){ return '₦' + Number(n).toLocaleString('en-NG', { maximumFractionDigits: 0 }); }

/* Items that have a real photo in images/products/<key>.jpg (these win over any embedded drawing). */
const PHOTO_KEYS = new Set(["afang","atare","avocado","bambara","banana","bayleaf","beans_brown","beans_white","beef","beetroot","bellpepper_green","bitterleaf","blackpepper","bonga","broccoli","broiler","broiler_svg","cabbage","carrot","cashew","cassava","cassava_sweet","catfish_live","cauliflower","celery","chicken_parts","cloves","cockerel","coconut","cocoyam","cow_red_bororo","cow_sokoto_gudali","cow_white_fulani","crayfish","croaker","cucumber","doc","duck","efo_shoko","efo_tete","eggs","egusi","ehuru","ewedu","fingerlings","fufu_flour","gardenegg","garlic","garri_white","garri_yellow","ginger","goat","goatmeat","greenbeans","groundnut_inshell","groundnut_oil","groundnut_shelled","guinea_fowl","honey","irish_potato","iru","kolanut","kulikuli","lafun","layer","lemongrass","lettuce","local_chicken","maize","maize_white","maize_yellow","mango","milk","millet","oats","ogbono","oha","okra","onion","orange","palm_oil","pawpaw","pepper","pepper_cameroon","pepper_rodo","pepper_shombo","pepper_tatashe","pepper_wewe","pig_duroc","pig_landrace","pig_mature","pig_weaner","pigeon_pea","pineapple","plantain_flour","plantain_ripe","plantain_unripe","popcorn","pork","potato","potato_orange","potato_purple","prawns","pumpkin","quail_eggs","rabbit","radish","ram","rice_bag","rice_brown","rice_local","rice_ofada","scentleaf","sesame","sese","sheep","snail","sorghum_red","sorghum_white","soybeans","spinach","spring_onion","stockfish","sunflower","tapioca","thyme","tigernut","titus","tomato","turkey","turmeric","turnip","uda","ugu","utazi","uziza_leaf","uziza_seed","wara","waterleaf","wheat","yam","yam_aerial","yam_bean","yam_flour","yam_puna","yam_water","yam_yellow"]);
/* Photos that also have a small card thumbnail in images/products/thumbs/ (faster to load than the full photo). */
const THUMB_KEYS = new Set(["afang","atare","avocado","bambara","banana","bayleaf","beans_brown","beans_white","beef","beetroot","bellpepper_green","bitterleaf","blackpepper","bonga","broccoli","broiler","broiler_svg","cabbage","carrot","cashew","cassava","cassava_sweet","catfish_live","cauliflower","celery","chicken_parts","cloves","cockerel","coconut","cocoyam","cow_red_bororo","cow_sokoto_gudali","cow_white_fulani","crayfish","croaker","cucumber","doc","duck","efo_shoko","efo_tete","eggs","egusi","ehuru","ewedu","fingerlings","fufu_flour","gardenegg","garlic","garri_white","garri_yellow","ginger","goat","goatmeat","greenbeans","groundnut_inshell","groundnut_oil","groundnut_shelled","guinea_fowl","honey","irish_potato","iru","kolanut","kulikuli","lafun","layer","lemongrass","lettuce","local_chicken","maize","maize_white","maize_yellow","mango","milk","millet","oats","ogbono","oha","okra","onion","orange","palm_oil","pawpaw","pepper","pepper_cameroon","pepper_rodo","pepper_shombo","pepper_tatashe","pepper_wewe","pig_duroc","pig_landrace","pig_mature","pig_weaner","pigeon_pea","pineapple","plantain_flour","plantain_ripe","plantain_unripe","popcorn","pork","potato","potato_orange","potato_purple","prawns","pumpkin","quail_eggs","rabbit","radish","ram","rice_bag","rice_brown","rice_local","rice_ofada","scentleaf","sesame","sese","sheep","snail","sorghum_red","sorghum_white","soybeans","spinach","spring_onion","stockfish","sunflower","tapioca","thyme","tigernut","titus","tomato","turkey","turmeric","turnip","uda","ugu","utazi","uziza_leaf","uziza_seed","wara","waterleaf","wheat","yam","yam_aerial","yam_bean","yam_flour","yam_puna","yam_water","yam_yellow"]);

function img(key, alt='', full=false){
  const embedded = !PHOTO_KEYS.has(key) && window.IMG && window.IMG[key];
  if(embedded) return `<img src="${embedded}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  // Item with a photo: small thumbnail for cards, the full photo for the zoom window. Without a photo: the coloured placeholder.
  // (Add a photo = save images/products/<key>.jpg, then run: node tools/build-catalog.js)
  const fallback = `this.onerror=function(){this.onerror=null;this.src='images/products/default.svg'};this.src='images/products/${key}.svg'`;
  if(PHOTO_KEYS.has(key)){
    const useThumb = !full && THUMB_KEYS.has(key);
    const src = `images/products/${useThumb ? 'thumbs/' : ''}${key}.jpg`;
    const retry = useThumb ? `this.onerror=function(){${fallback}};this.src='images/products/${key}.jpg'` : fallback;
    return `<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="${retry}">`;
  }
  return `<img src="images/products/${key}.svg" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='images/products/default.svg'">`;
}

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function uid(p){ return p + '-' + Math.random().toString(36).slice(2,8); }

function clamp(val,min,max){ return Math.max(min, Math.min(max, val)); }

/* Measurement techniques (kg, derica, bunch, crate ...) live in units.js. */
const U = window.BMUnits || {
  name: (u, q) => String(u || ''), fmt: n => String(n), cap: s => String(s), qtyText: (q, u) => q + ' ' + u,
  priceFor: (p, q) => (Number(q) === 1 ? Math.round(p) : Math.round(p * q / 10) * 10)
};
const unitName = (item, qty) => U.name(item.unit, qty);
const alsoBy = item => {
  const others = [...new Set((item.measures || []).map(m => m.unit).filter(u => u !== item.unit))].slice(0, 3);
  return others.length ? ' \u00b7 also by ' + others.map(u => U.name(u)).join(', ') : '';
};

function findBase(id){
  return PRODUCE.find(p => p.id === id) || LIVESTOCK.find(l => l.id === id);
}

// Items sold by weight (rice, garri, pig, pork, broiler) have a price per kg. The buyer's choice
// (live/processed + kg) is packed into the cart line id: "base~mode~kg", e.g. "l-broiler~live~2".
const hasOpts = item => !!(item && ((item.measures && item.measures.length) || item.modes));
function lineId(baseId, mode, measureKey){ return [baseId, mode || '', measureKey || ''].join('~'); }

function findItem(id){
  if(String(id).includes('~')){
    const [baseId, mode, key] = id.split('~');
    const base = findBase(baseId);
    if(!base) return undefined;
    // key = which way of buying it (e.g. "derica-1.8", "bag-50", "dozen-12"); old carts used a plain kg number
    let m = (base.measures || []).find(x => x.key === key);
    if(!m && Number(key) > 0 && base.unit === 'kg') m = { unit: 'kg', qty: Number(key), key: 'kg-' + Number(key), label: Number(key) + ' kg' };
    const per = m ? m.qty : 1;
    const unitPrice = (mode && base.modes && base.modes[mode]) || base.price;
    const label = [mode ? mode[0].toUpperCase() + mode.slice(1) : '', m ? m.label : ''].filter(Boolean).join(', ');
    return { ...base, id, baseId, mode: mode || null, measureKey: m ? m.key : null, measureLabel: m ? m.label : null,
             weightKg: m && base.unit === 'kg' ? m.qty : null, unitPrice,
             name: label ? `${base.name} (${label})` : base.name,
             price: U.priceFor(unitPrice, per),
             stock: Math.floor(base.stock / per) };
  }
  return findBase(id);
}

/* ──────────────────────────────────────────────────────────────
   4. TOAST
────────────────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success'){
  const t = $('toast');
  const dot = t.querySelector('.dot');
  $('toastMsg').textContent = msg;
  dot.style.background = type === 'error' ? 'var(--danger)' : 'var(--mint)';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ──────────────────────────────────────────────────────────────
   5. AUTH SYSTEM (localStorage-backed; sign-in itself happens on
   its own page — login.html — not a popup on the storefront)
────────────────────────────────────────────────────────────── */
function loadSession(){
  try {
    const s = localStorage.getItem('bm_session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function saveSession(user){ localStorage.setItem('bm_session', JSON.stringify(user)); }
function clearSession(){ localStorage.removeItem('bm_session'); }

function getUsers(){
  try { return JSON.parse(localStorage.getItem('bm_users') || '[]'); } catch { return []; }
}
function saveUsers(users){ localStorage.setItem('bm_users', JSON.stringify(users)); }

function updateAuthUI(){
  const btn       = $('authBtn');
  const btnTxt    = $('authBtnText');
  const ordersBtn = $('myOrdersBtn');
  if(currentUser){
    btn.classList.add('signed-in');
    btnTxt.textContent = currentUser.name.split(' ')[0];
    btn.setAttribute('title', `Signed in as ${currentUser.name} — click to sign out`);
    btn.onclick = confirmSignOut;
    if(ordersBtn) ordersBtn.style.display = '';
  } else {
    btn.classList.remove('signed-in');
    btnTxt.textContent = 'Login / Sign up';
    btn.setAttribute('title', '');
    btn.onclick = goToAuth;
    if(ordersBtn) ordersBtn.style.display = 'none';
  }

  // Staff accounts use the same login: show a shortcut to the admin dashboard.
  const isStaff = !!(currentUser && ['admin', 'manager', 'staff'].includes(currentUser.role));
  let dash = $('dashBtn');
  if(isStaff && !dash){
    dash = document.createElement('a');
    dash.id = 'dashBtn';
    dash.className = 'auth-btn';
    dash.href = 'admin.html';
    dash.style.textDecoration = 'none';
    dash.title = 'Open the admin dashboard';
    dash.innerHTML = '<span class="ab-text">Dashboard</span>';
    btn.parentNode.insertBefore(dash, btn);
  }
  if(dash) dash.style.display = isStaff ? '' : 'none';
}

function confirmSignOut(){
  if(!confirm(`Sign out of your Bouesti account (${currentUser.name})?`)) return;
  // End the server login too (the dashboard uses the same one), then forget it in this browser.
  const token = localStorage.getItem(TOKEN_KEY);
  if(token) fetch('/api/auth/logout', { method:'POST', headers:{ Authorization:'Bearer ' + token } }).catch(() => {});
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
  currentUser = null;
  clearSession();
  updateAuthUI();
  showToast('Signed out successfully');
}

// Send the visitor to the dedicated login/sign-up page, remembering
// where to bring them back to once they're signed in.
function goToAuth(){
  try { sessionStorage.setItem('bm_auth_return', location.href); } catch {}
  location.href = 'login.html';
}

/* ──────────────────────────────────────────────────────────────
   5B. ADMIN DASHBOARD BRIDGE (offline / no backend hosted yet)

   The admin dashboard (admin.html + admin.js) runs its own local
   demo backend when it can't reach a real server — everything it
   shows lives in one localStorage key, 'bm_admin_offline_db_v1'.
   This section writes straight into that same key, so real
   activity on THIS storefront (a customer signing in, an order
   being placed) shows up immediately in the admin's User
   Management and Orders panels — no hosting required.

   If the admin dashboard has never been opened in this browser
   yet, loadAdminDB() seeds the exact same baseline demo data
   admin.js itself would seed (same 3 staff logins, same settings
   shape), so whichever page runs first, nothing breaks and
   nothing gets out of sync.
────────────────────────────────────────────────────────────── */
const ADMIN_DB_KEY = 'bm_admin_offline_db_v1';

function seedAdminDB(){
  const now = new Date().toISOString();
  const users = [
    { id: uid('id'), name: 'Success Admin', email: 'admin@bouesti.ng',   password: 'Admin@12345',   role: 'admin',   status: 'active', createdAt: now, lastLogin: null, twoFactorEnabled: false, loginHistory: [] },
    { id: uid('id'), name: 'Bunmi Manager', email: 'manager@bouesti.ng', password: 'Manager@12345', role: 'manager', status: 'active', createdAt: now, lastLogin: null, twoFactorEnabled: false, loginHistory: [] },
    { id: uid('id'), name: 'Kunle Staff',   email: 'staff@bouesti.ng',   password: 'Staff@12345',   role: 'staff',   status: 'active', createdAt: now, lastLogin: null, twoFactorEnabled: false, loginHistory: [] },
  ];

  // Mirrors admin.js's own seedOfflineDB() exactly — so the dashboard
  // looks fully populated (demo products, banners, order history)
  // whichever page a visitor opens first in this browser.
  const cats = {
    produce: ['Fresh Pepper (Basket)', 'Yam Tubers (5pcs)', 'Pumpkin Leaves (Bunch)', 'Tomatoes (Crate)', 'Cassava (Bag)'],
    livestock: ['Broiler Chicken', 'Layer Chicken', 'Weaner Pig', 'Goat (Male)', 'Turkey'],
    insurance: ['Livestock Insurance — Basic', 'Crop Insurance — Seasonal', 'Farm Asset Cover'],
  };
  const products = [];
  Object.entries(cats).forEach(([cat, names]) => names.forEach((n, i) => products.push({
    id: uid('id'), category: cat, title: n, price: Math.round(Math.random() * 40000 + 5000), stock: Math.round(Math.random() * 80 + 5),
    status: i % 4 === 0 ? 'draft' : 'published', image: null, createdAt: now, updatedAt: now,
  })));
  const banners = [
    { id: uid('id'), title: 'Fresh from Ekiti Farms', subtitle: 'Farm produce delivered across all 16 LGAs', status: 'published', createdAt: now },
    { id: uid('id'), title: 'Livestock Season Sale', subtitle: 'Broilers and pigs at harvest prices', status: 'draft', createdAt: now },
  ];
  const demoOrders = [];
  const demoStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
  const demoNames = ['Amaka Customer', 'Tunde Ayo', 'Folake Bello', 'Segun Ade', 'Ronke Ojo'];
  for(let i = 0; i < 24; i++){
    const created = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30);
    demoOrders.push({ id: uid('id'), customer: demoNames[i % demoNames.length], lga: EKITI_LGAS[i % EKITI_LGAS.length], items: Math.round(Math.random() * 4 + 1), total: Math.round(Math.random() * 60000 + 3000), status: demoStatuses[Math.floor(Math.random() * demoStatuses.length)], createdAt: created.toISOString() });
  }

  return {
    users, products, banners, orders: demoOrders,
    notifications: [{ id: uid('id'), type: 'system', title: 'Welcome to Bouesti Admin', message: 'You are running in local demo mode — no backend server was detected, so all data here is stored in your browser only.', createdAt: now, read: false }],
    logs: [{ id: uid('id'), date: new Date().toLocaleDateString('en-NG'), time: new Date().toLocaleTimeString('en-NG'), ip: 'local', browser: 'Demo', user: 'system', action: 'Started local demo session' }],
    settings: { marketplaceName: 'Bouesti Marketplace', logo: '', theme: 'dark', currency: 'NGN', deliveryFees: { base: 800 }, contact: {}, smtp: { host: '', configured: false }, paymentGateway: { provider: 'paystack', publicKey: '', configured: false }, lastBackupAt: null },
    meta: { ekitiLgas: EKITI_LGAS },
  };
}
function loadAdminDB(){
  try { const raw = localStorage.getItem(ADMIN_DB_KEY); if (raw) return JSON.parse(raw); } catch {}
  const fresh = seedAdminDB();
  saveAdminDB(fresh); // persist immediately so repeated reads don't re-randomize before any write happens
  return fresh;
}
function saveAdminDB(db){ try { localStorage.setItem(ADMIN_DB_KEY, JSON.stringify(db)); } catch {} }
function logAdminActivity(db, who, action){
  db.logs.unshift({ id: uid('id'), date: new Date().toLocaleDateString('en-NG'), time: new Date().toLocaleTimeString('en-NG'), ip: 'local', browser: 'Demo', user: who || 'storefront', action });
  db.logs = db.logs.slice(0, 300);
}

// Finds (or creates) the admin-side customer record matching the
// signed-in storefront user, keyed by email — same key admin.js
// itself uses everywhere. Safe to call any time currentUser is set.
function syncCustomerToAdmin(phoneOverride){
  if(!currentUser) return null;
  const db  = loadAdminDB();
  const key = String(currentUser.email || '').trim().toLowerCase();
  let record = key ? db.users.find(u => u.role === 'customer' && u.email.toLowerCase() === key) : null;
  const phone = phoneOverride || currentUser.phone || '';

  if(!record){
    record = {
      id: uid('id'),
      name: currentUser.name || 'Guest customer',
      email: currentUser.email || `${(currentUser.name || 'guest').toLowerCase().replace(/[^a-z0-9]+/g,'.')}@customer.local`,
      phone, role: 'customer', status: 'active',
      createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(),
      twoFactorEnabled: false, loginHistory: [],
    };
    db.users.push(record);
    logAdminActivity(db, 'storefront', `New customer account: ${record.email}`);
  } else {
    record.lastLogin = new Date().toISOString();
    if(phone) record.phone = phone;
  }
  saveAdminDB(db);
  return record;
}

// Called at checkout — links the order to the synced customer
// record and drops it straight into the admin's Orders panel. Uses
// the (possibly edited) checkout-form name for the order itself —
// e.g. someone ordering for delivery to a different recipient —
// while the linked account record keeps the signed-in user's name.
function syncOrderToAdmin({ ref, name, lga, addr, pay, phone, itemCount, total }){
  try {
    const record = syncCustomerToAdmin(phone);
    const db = loadAdminDB();
    const customerName = name || currentUser?.name || 'Guest';
    db.orders.unshift({
      id: uid('id'), ref,
      customer: customerName,
      customerEmail: (record && record.email) || '',
      lga, items: itemCount, total, status: 'pending',
      address: addr, payMethod: pay,
      createdAt: new Date().toISOString(),
    });
    logAdminActivity(db, 'storefront', `New order ${ref} from ${customerName} — ${naira(total)}`);
    saveAdminDB(db);
  } catch(err) { /* storage blocked or unavailable — checkout still succeeds either way */ }
}

// Powers "My Orders" on the storefront — reads the same shared
// store the admin writes back to, so status changes an admin makes
// (processing / delivered / cancelled) show up here too.
function getMyOrders(){
  if(!currentUser) return [];
  const db  = loadAdminDB();
  const key = String(currentUser.email || '').trim().toLowerCase();
  return db.orders
    .filter(o => (o.customerEmail || '').toLowerCase() === key)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/* ──────────────────────────────────────────────────────────────
   6. RENDER: PRODUCT CARDS
────────────────────────────────────────────────────────────── */
function buildCard(item, kind){
  const inCart = cart.find(c => c.id === item.id);
  const qty    = inCart ? inCart.qty : 1;
  const low    = item.stock > 0 && item.stock <= 5;
  const out    = item.stock === 0;
  const badge  = out
    ? `<span class="badge out">Sold out</span>`
    : low
    ? `<span class="badge low">Only ${item.stock} left</span>`
    : `<span class="badge">In stock</span>`;

  return `
  <article class="card reveal-card${hasOpts(item) ? ' has-opts' : ''}" data-id="${item.id}" data-kind="${kind}">
    <div class="imgwrap">${img(item.img, item.name)}${badge}</div>
    <div class="body">
      <h3>${esc(item.name)}</h3>
      <div class="unit">per ${esc(unitName(item))}${item.modes ? ' \u00b7 live or processed' : esc(alsoBy(item))}</div>
      <p style="font-size:12px;color:var(--text-faint);line-height:1.5;margin-top:4px;">${esc(item.desc)}</p>
      <div class="price-row">
        <div class="price">${naira(item.price)}<sup>/${esc(unitName(item))}</sup></div>
        <div class="qty-add">
          <div class="stepper">
            <button type="button" class="qminus" aria-label="Decrease">−</button>
            <span class="qv" id="qv-${item.id}">${qty}</span>
            <button type="button" class="qplus" aria-label="Increase">+</button>
          </div>
          <button type="button" class="add-btn ${inCart ? 'added' : ''} ${out ? 'disabled-btn' : ''}"
                  data-add="${item.id}" aria-label="Add to cart" ${out ? 'disabled' : ''}>
            ${inCart
              ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 7" stroke-linecap="round"/></svg>`
              : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>`
            }
          </button>
        </div>
      </div>
    </div>
  </article>`;
}

function wireCards(grid){
  grid.querySelectorAll('.card').forEach(card => {
    const id   = card.dataset.id;
    const kind = card.dataset.kind;
    const item = findItem(id);
    if(!item) return;

    card.querySelector('.imgwrap')?.addEventListener('click', () => openProduct(id));
    card.querySelector('h3')?.addEventListener('click', () => openProduct(id));

    const qvEl = card.querySelector(`#qv-${id}`);
    let localQty = parseInt(qvEl?.textContent || '1');

    card.querySelector('.qminus')?.addEventListener('click', () => {
      localQty = clamp(localQty - 1, 1, item.stock || 1);
      if(qvEl) qvEl.textContent = localQty;
      // also update cart if already added
      const line = cart.find(c => c.id === id);
      if(line){ line.qty = localQty; renderCart(); }
    });

    card.querySelector('.qplus')?.addEventListener('click', () => {
      localQty = clamp(localQty + 1, 1, item.stock);
      if(qvEl) qvEl.textContent = localQty;
      const line = cart.find(c => c.id === id);
      if(line){ line.qty = localQty; renderCart(); }
    });

    card.querySelector(`[data-add="${id}"]`)?.addEventListener('click', () => {
      if(item.stock === 0) return;
      if(hasOpts(item)){ openProduct(id); return; }   // needs a pack size / live-or-processed choice
      if(!currentUser){
        showToast('Please log in or sign up to add items to cart', 'error');
        setTimeout(goToAuth, 250);
        return;
      }
      addToCart(id, kind, localQty);
      pulseAddBtn(card.querySelector(`[data-add="${id}"]`));
    });
  });
}

function pulseAddBtn(btn){
  if(!btn) return;
  btn.style.transform = 'scale(1.25)';
  setTimeout(() => { btn.style.transform = ''; }, 200);
}

const catInfo   = key => CATEGORIES.find(c => c.key === key) || { key, label: key, short: key, kind: 'produce' };
const catLabel  = key => catInfo(key).label;

// Cards grouped under their category heading (in the order of CATEGORIES). One category selected = one group.
function groupedCards(items, kind){
  const order = CATEGORIES.map(c => c.key);
  const present = [...new Set(items.map(p => p.category))].sort((x, y) => {
    const ix = order.indexOf(x), iy = order.indexOf(y);
    return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
  });
  return present.map(key => {
    const list = items.filter(p => p.category === key);
    return `<h3 class="sub-head" style="grid-column:1/-1;">${esc(catLabel(key))} <span style="font-weight:400;opacity:.6;font-size:.7em;">(${list.length})</span></h3>` +
      list.map(p => buildCard(p, kind)).join('');
  }).join('');
}

function updateProductCount(){
  const el = $('statProducts');
  if(el) el.textContent = PRODUCE.length + LIVESTOCK.length;
}

function renderProduce(){
  const grid = $('produceGrid');
  const term = searchTerm.toLowerCase();
  const items = PRODUCE.filter(p => {
    const matchCat  = pFilter === 'all' || p.category === pFilter;
    const matchTerm = !term || p.name.toLowerCase().includes(term) || catLabel(p.category).toLowerCase().includes(term);
    return matchCat && matchTerm;
  });

  if(items.length === 0){
    grid.innerHTML = `<p style="color:var(--text-faint);font-size:14px;grid-column:1/-1;padding:20px 0;">No produce matches "<em>${esc(searchTerm)}</em>". Try clearing the search.</p>`;
    updateProductCount();
    return;
  }

  grid.innerHTML = groupedCards(items, 'produce');
  wireCards(grid);
  staggerReveal(grid.querySelectorAll('.reveal-card'));
  updateProductCount();
}

function renderLivestock(){
  const grid = $('livestockGrid');
  const term = searchTerm.toLowerCase();
  const items = LIVESTOCK.filter(l => {
    const matchCat  = lFilter === 'all' || l.category === lFilter;
    const matchTerm = !term || l.name.toLowerCase().includes(term) || catLabel(l.category).toLowerCase().includes(term);
    return matchCat && matchTerm;
  });

  if(items.length === 0){
    grid.innerHTML = `<p style="color:var(--text-faint);font-size:14px;grid-column:1/-1;padding:20px 0;">No livestock matches "<em>${esc(searchTerm)}</em>".</p>`;
    return;
  }

  grid.innerHTML = groupedCards(items, 'livestock');
  wireCards(grid);
  staggerReveal(grid.querySelectorAll('.reveal-card'));
}

/* ──────────────────────────────────────────────────────────────
   7. CART ENGINE
────────────────────────────────────────────────────────────── */
function addToCart(id, kind, qty = 1){
  const item = findItem(id);
  if(!item || item.stock === 0) return;

  const existing = cart.find(c => c.id === id);
  if(existing){
    existing.qty = clamp(existing.qty + qty, 1, item.stock);
    showToast(`Updated: ${item.name} ×${existing.qty}`);
  } else {
    cart.push({ id, kind, qty: clamp(qty, 1, item.stock) });
    showToast(`${item.name} added to cart 🛒`);
  }
  renderCart();
  renderProduce();
  renderLivestock();
  animateCartBadge();
}

function removeFromCart(id){
  cart = cart.filter(c => c.id !== id);
  renderCart();
  renderProduce();
  renderLivestock();
}

function changeCartQty(id, delta){
  const line = cart.find(c => c.id === id);
  if(!line) return;
  const item = findItem(id);
  const newQty = clamp(line.qty + delta, 1, item?.stock ?? 99);
  line.qty = newQty;
  renderCart();
}

function animateCartBadge(){
  const badge = $('cartCount');
  badge.style.transform = 'scale(1.6)';
  badge.style.background = 'var(--danger)';
  setTimeout(() => {
    badge.style.transform = 'scale(1)';
    badge.style.background = 'var(--dark)';
  }, 300);
}

function renderCart(){
  const body   = $('drawerBody');
  const foot   = $('drawerFoot');
  const countEl = $('cartCount');

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  countEl.textContent = totalItems;

  if(cart.length === 0){
    body.innerHTML = `
      <div class="drawer-empty">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg>
        <b>Your cart is empty</b>
        <p style="font-size:13px;">Add some produce or livestock to get started.</p>
      </div>`;
    foot.style.display = 'none';
    return;
  }

  let subtotal = 0;
  body.innerHTML = cart.map(line => {
    const item   = findItem(line.id);
    if(!item) return '';
    const total  = item.price * line.qty;
    subtotal    += total;
    return `
    <div class="cart-line" data-id="${item.id}">
      ${img(item.img, item.name).replace('<img', '<img style="width:60px;height:60px;border-radius:8px;object-fit:cover;"')}
      <div class="cl-info">
        <div class="cl-top">
          <span class="nm">${esc(item.name)}</span>
          <button type="button" class="rm" data-remove="${item.id}">Remove</button>
        </div>
        <div class="cl-meta">${esc(item.measureLabel || unitName(item))}</div>
        <div class="cl-bottom">
          <div class="stepper">
            <button type="button" data-cm="${item.id}">−</button>
            <span class="qv">${line.qty}</span>
            <button type="button" data-cp="${item.id}">+</button>
          </div>
          <span class="price">${naira(total)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  const fee      = Math.round(subtotal * FEE);
  const delivery = DELIVERY;
  const total    = subtotal + fee + delivery;

  $('sumSubtotal').textContent = naira(subtotal);
  $('sumFee').textContent      = naira(fee);
  $('sumDelivery').textContent = naira(delivery);
  $('sumTotal').textContent    = naira(total);
  foot.style.display           = 'block';

  // Wire cart line controls
  body.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
  body.querySelectorAll('[data-cm]').forEach(btn => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.cm, -1));
  });
  body.querySelectorAll('[data-cp]').forEach(btn => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.cp, 1));
  });
}

/* ──────────────────────────────────────────────────────────────
   8. CART DRAWER OPEN/CLOSE
────────────────────────────────────────────────────────────── */
function openCart(){
  $('drawer').classList.add('open');
  $('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart(){
  $('drawer').classList.remove('open');
  $('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────
   9. CHECKOUT
────────────────────────────────────────────────────────────── */
function cartSubtotal(){
  return cart.reduce((sum, c) => { const it = findItem(c.id); return it ? sum + it.price * c.qty : sum; }, 0);
}

function checkoutTotals(state){
  const subtotal = cartSubtotal();
  const fee      = Math.round(subtotal * FEE);
  const delivery = deliveryFor(state);
  return { subtotal, fee, delivery, total: subtotal + fee + delivery };
}

function openCheckout(){
  if(cart.length === 0) return;
  if(!currentUser){
    closeCart();
    showToast('Please log in to place an order', 'error');
    setTimeout(goToAuth, 250);
    return;
  }
  const modal   = $('checkoutModal');
  const overlay = $('checkoutOverlay');
  const t0      = checkoutTotals('Ekiti');

  modal.innerHTML = `
    <div class="modal-head">
      <h3>Complete your order</h3>
      <button type="button" id="closeCheckout">×</button>
    </div>
    <div class="modal-body">
      <form id="checkoutForm">
        <div class="field">
          <label>Full name</label>
          <input id="ck-name" type="text" required value="${esc(currentUser.name)}" placeholder="Full name">
        </div>
        <div class="field-row">
          <div class="field">
            <label>Phone number</label>
            <input id="ck-phone" type="tel" required value="${esc(currentUser.phone||'')}" placeholder="080…">
          </div>
          <div class="field">
            <label>Delivery date</label>
            <input id="ck-date" type="date" required min="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Delivery state</label>
            <select id="ck-state" required>
              ${DELIVERY_STATES.map(st => `<option value="${st.name}">${st.name}</option>`).join('')}
            </select>
          </div>
          <div class="field" id="ck-area"></div>
        </div>
        <div class="field">
          <label>Payment method</label>
          <select id="ck-pay">
            <option>Pay on delivery</option>
            <option>Bank transfer</option>
            <option>Card payment</option>
          </select>
        </div>
        <div class="field">
          <label>Street address</label>
          <input id="ck-addr" type="text" required placeholder="House no., street, nearest landmark">
          <div class="field-help">We deliver in Ekiti, Osun, Ondo, Kwara, Kogi, Edo and Ogun. <a href="delivery-areas.html" target="_blank" rel="noopener" style="color:var(--mint);">See delivery areas</a></div>
        </div>
        <div style="background:var(--dark-3);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:13px;color:var(--text-dim);">
          <strong style="color:var(--mint);">Order summary:</strong><br>
          ${cart.map(c => { const it = findItem(c.id); return it ? `${esc(it.name)} ×${c.qty}` : ''; }).join(' &nbsp;·&nbsp; ')}<br>
          <div style="margin-top:8px;">Subtotal: <span id="ck-sub">${naira(t0.subtotal)}</span></div>
          <div>Service fee (5%): <span id="ck-fee">${naira(t0.fee)}</span></div>
          <div>Delivery to <span id="ck-dstate">Ekiti</span>: <span id="ck-del">${naira(t0.delivery)}</span></div>
          <strong style="color:var(--white);">Total: <span id="ck-total">${naira(t0.total)}</span></strong>
        </div>
        <button type="submit" class="checkout-btn" id="ck-submit">Place order — ${naira(t0.total)}</button>
      </form>
    </div>
  `;

  // Ekiti → pick one of the 16 LGAs; other states → type your town / LGA.
  function renderArea(){
    const state = $('ck-state').value;
    $('ck-area').innerHTML = state === 'Ekiti'
      ? `<label>LGA (Ekiti State)</label><select id="ck-lga" required>
           <option value="" disabled selected>Select your LGA</option>
           ${EKITI_LGAS.map(l => `<option value="${l}">${l}</option>`).join('')}
         </select>`
      : `<label>Town / LGA in ${esc(state)}</label><input id="ck-town" type="text" required placeholder="e.g. Ilesa">`;
    const t = checkoutTotals(state);
    $('ck-dstate').textContent = state;
    $('ck-del').textContent    = naira(t.delivery);
    $('ck-total').textContent  = naira(t.total);
    $('ck-submit').textContent = `Place order — ${naira(t.total)}`;
  }
  $('ck-state').addEventListener('change', renderArea);
  renderArea();

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  $('closeCheckout').addEventListener('click', closeCheckoutModal);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeCheckoutModal(); });
  $('checkoutForm').addEventListener('submit', handleOrderSubmit);
}

function closeCheckoutModal(){
  $('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Receipts ──────────────────────────────────────────────
// A copy of every order is kept in this browser so the receipt can be printed again later
// (receipt.html reads it; when the server is running it also loads the receipt from the database).
const RECEIPTS_KEY = 'bm_receipts';
function loadReceipts(){
  try { return JSON.parse(localStorage.getItem(RECEIPTS_KEY) || '{}'); } catch { return {}; }
}
function saveReceipt(receipt){
  const all = loadReceipts();
  all[receipt.ref] = receipt;
  const refs = Object.keys(all);
  if(refs.length > 50) delete all[refs[0]];            // keep the 50 most recent
  try { localStorage.setItem(RECEIPTS_KEY, JSON.stringify(all)); } catch {}
}
function hasReceipt(ref){ return !!loadReceipts()[ref]; }

// Items of the cart, written the way the receipt prints them.
function receiptLines(){
  return cart.map(c => {
    const it   = findItem(c.id);
    const base = findBase(it.baseId || it.id) || it;
    return { name: base.name, mode: it.mode || null, weightKg: it.weightKg || null, measure: it.measureLabel || null,
             unitPrice: it.price, qty: c.qty, lineTotal: it.price * c.qty };
  });
}

// Small helper for talking to server.js (only used when SERVER is true).
async function api(method, path, body){
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if(!res.ok){ const err = new Error(data.error || 'Request failed'); err.status = res.status; throw err; }
  return data;
}

async function handleOrderSubmit(e){
  e.preventDefault();
  const name  = $('ck-name').value.trim();
  const phone = $('ck-phone').value.trim();
  const state = $('ck-state').value;
  const area  = state === 'Ekiti' ? $('ck-lga').value : $('ck-town').value.trim();
  const addr  = $('ck-addr').value.trim();
  const pay   = $('ck-pay').value;
  const date  = $('ck-date').value;
  const where = state === 'Ekiti' ? area : `${area}, ${state}`;
  const t     = checkoutTotals(state);

  let ref, total = t.total, trackable = false, serverOrder = null;
  const submitBtn = $('ck-submit');
  submitBtn.disabled = true;

  if(SERVER){
    // Real order in the database (admin dashboard, GPS tracking and stock all use it).
    if(!localStorage.getItem(TOKEN_KEY)){
      submitBtn.disabled = false;
      showToast('Please log in again to place your order', 'error');
      setTimeout(goToAuth, 250);
      return;
    }
    try {
      const data = await api('POST', '/orders', {
        items: cart.map(c => {
          const it = findItem(c.id);
          return { ...(it.sid ? { productId: it.sid } : { sku: it.baseId || it.id }),
                   qty: c.qty, mode: it.mode || undefined, measure: it.measureKey || undefined, weightKg: it.weightKg || undefined };
        }),
        state, lga: area, address: addr, phone, payMethod: pay, deliveryDate: date
      });
      ref = data.order.ref; total = data.order.total; trackable = true; serverOrder = data.order;
    } catch(err){
      submitBtn.disabled = false;
      if(err.status === 401){
        try { localStorage.removeItem(TOKEN_KEY); } catch {}
        showToast('Your login expired — please log in again', 'error');
        setTimeout(goToAuth, 250);
      } else {
        showToast(err.message, 'error');
      }
      return;
    }
  } else {
    // No server: keep the old browser-only behaviour (shared offline store for the admin demo).
    ref = 'BST-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);
    syncOrderToAdmin({ ref, name, lga: where, addr, pay, phone, itemCount, total });
  }

  saveReceipt({
    ref, createdAt: new Date().toISOString(), status: 'pending',
    customerName: name, customerPhone: phone, customerEmail: currentUser.email || '',
    address: addr, lga: area, state, deliveryDate: date, payMethod: pay,
    paymentStatus: serverOrder ? serverOrder.paymentStatus : 'unpaid',
    subtotal:   serverOrder ? serverOrder.subtotal   : t.subtotal,
    serviceFee: serverOrder ? serverOrder.serviceFee : t.fee,
    deliveryFee: serverOrder ? serverOrder.deliveryFee : t.delivery,
    total,
    items: serverOrder ? serverOrder.items : receiptLines()
  });

  $('checkoutModal').innerHTML = `
    <div class="modal-body modal-success" style="padding-top:24px;">
      <div class="check">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h3>Order placed! 🎉</h3>
      <p>Your order is confirmed for delivery to <strong style="color:var(--mint);">${esc(where)}${state === 'Ekiti' ? ', Ekiti State' : ''}</strong>. You'll receive a confirmation call shortly.</p>
      <div class="order-ref">${esc(ref)}</div>
      <p style="margin-top:14px;">
        <a href="receipt.html?ref=${encodeURIComponent(ref)}&print=1" target="_blank" rel="noopener" style="color:var(--mint);font-weight:700;">🖨 Print receipt</a>
        &nbsp;·&nbsp;
        <a href="receipt.html?ref=${encodeURIComponent(ref)}" target="_blank" rel="noopener" style="color:var(--mint);font-weight:700;">View receipt</a>
      </p>
      <p style="margin-top:12px;"><a href="track.html?ref=${encodeURIComponent(ref)}" style="color:var(--mint);font-weight:700;">📍 Track this order</a></p>
      <p style="margin-top:16px;font-size:12.5px;">Need help? Message us on
        <a href="https://wa.me/2347086087995?text=Hi+Bouesti+Marketplace,+order+${encodeURIComponent(ref)}" target="_blank" rel="noopener" style="color:var(--mint);font-weight:700;">WhatsApp</a>
        or email
        <a href="mailto:successjomiloju@gmail.com?subject=Order+${encodeURIComponent(ref)}" style="color:var(--mint);font-weight:700;">successjomiloju@gmail.com</a>
      </p>
      <button type="button" class="btn-auth" style="margin-top:20px;" id="doneBtn">Done</button>
    </div>
  `;

  animateSuccessCheck();

  $('doneBtn').addEventListener('click', () => {
    cart = [];
    renderCart();
    renderProduce();
    renderLivestock();
    closeCheckoutModal();
    closeCart();
  });
}

function animateSuccessCheck(){
  const check = $('checkoutModal').querySelector('.check');
  if(!check) return;
  check.style.transform = 'scale(0)';
  check.style.opacity = '0';
  requestAnimationFrame(() => {
    check.style.transition = 'transform 0.5s cubic-bezier(.34,1.56,.64,1), opacity 0.3s ease';
    check.style.transform = 'scale(1)';
    check.style.opacity = '1';
  });
}

/* ──────────────────────────────────────────────────────────────
   9B. ORDER HISTORY
   Reads live from the same shared store the admin dashboard
   writes to, so a status change made from the admin side
   (processing / delivered / cancelled) shows up here too.
────────────────────────────────────────────────────────────── */
const ORDER_STATUS_LABEL = { pending: 'Pending', processing: 'Processing', delivered: 'Delivered', cancelled: 'Cancelled' };

// Orders for the My Orders window: the database when the server is running, else the browser store.
async function getOrdersForView(){
  if(SERVER && localStorage.getItem(TOKEN_KEY)){
    try {
      const data = await api('GET', '/orders/mine');
      return data.items.map(o => ({
        ref: o.ref, lga: o.state && o.state !== 'Ekiti' ? `${o.lga}, ${o.state}` : o.lga,
        items: o.items.length, total: o.total, status: o.status,
        createdAt: String(o.createdAt).replace(' ', 'T') + 'Z', address: o.address, trackable: true
      }));
    } catch {}
  }
  return getMyOrders();
}

async function openOrderHistory(){
  if(!currentUser){
    showToast('Please log in to view your orders', 'error');
    setTimeout(goToAuth, 250);
    return;
  }

  const overlay = $('ordersHistoryOverlay');
  const modal   = $('ordersHistoryModal');
  const orders  = await getOrdersForView();

  modal.innerHTML = `
    <div class="modal-head">
      <h3>My orders</h3>
      <button type="button" id="closeOrderHistory">×</button>
    </div>
    <div class="modal-body">
      ${orders.length === 0 ? `
        <div class="drawer-empty" style="padding:6px 0 4px;">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg>
          <b>No orders yet</b>
          <p style="font-size:13px;">Add some produce or livestock to the cart to place your first order.</p>
        </div>
      ` : `
        <div class="order-hist-list">
          ${orders.map(o => `
            <div class="order-hist-item">
              <div class="ohi-top">
                <span class="ohi-ref">${esc(o.ref || o.id)}</span>
                <span class="status-badge status-${o.status}">${ORDER_STATUS_LABEL[o.status] || o.status}</span>
              </div>
              <div class="ohi-meta">${esc(o.lga || '—')} &nbsp;·&nbsp; ${o.items} item${o.items === 1 ? '' : 's'} &nbsp;·&nbsp; ${new Date(o.createdAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</div>
              ${o.address ? `<div class="ohi-addr">${esc(o.address)}</div>` : ''}
              <div class="ohi-bottom"><span class="ohi-total">${naira(o.total)}</span>${(o.trackable || hasReceipt(o.ref)) ? `<a class="ohi-track" href="receipt.html?ref=${encodeURIComponent(o.ref)}" target="_blank" rel="noopener">🧾 Receipt</a>` : ''}${o.ref ? `<a class="ohi-track" href="track.html?ref=${encodeURIComponent(o.ref)}" style="margin-left:12px;">📍 Track order</a>` : ''}</div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  $('closeOrderHistory').addEventListener('click', closeOrderHistory);
}

function closeOrderHistory(){
  $('ordersHistoryOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────
   10. FILTER WIRING
────────────────────────────────────────────────────────────── */
function wireFilters(containerId, applyFn){
  const container = $(containerId);
  if(!container) return;
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Ripple effect on filter click
      addRipple(btn);
      applyFn(btn.dataset.filter);
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   11. ANIMATIONS & SCROLL EFFECTS
────────────────────────────────────────────────────────────── */

/* ── Stagger card reveals ───────────────────────────────────── */
function staggerReveal(cards){
  // Only the first row animates (a subtle, quick fade); everything else is simply there - no waiting for 100+ cards.
  Array.from(cards).slice(0, 8).forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(10px)';
    card.style.transition= `opacity 0.22s ease ${i * 0.03}s, transform 0.22s ease ${i * 0.03}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ── IntersectionObserver — section reveal ──────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el  = entry.target;
    const i   = el.dataset.revealIndex || 0;
    el.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(.16,1,.3,1) ${i * 0.12}s`;
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';
    revealObserver.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function setupRevealObserver(){
  // Reveal on: trust items, how-cards, ins-cards, contact-cards, lga-chips, section heads
  const selectors = [
    '.trust-item',
    '.how-card',
    '.ins-card',
    '.contact-card',
    '.lga-chip',
    '.section-head',
    '.sell-grid > div',
    '.hero-stats .stat',
    '.foot-col',
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(30px)';
      el.dataset.revealIndex = i;
      revealObserver.observe(el);
    });
  });
}

/* ── Hero floating cards ────────────────────────────────────── */
function setupHeroFloats(){
  const cards = [
    { el: $('hc1'), amp: 8,  period: 3000, delay: 0    },
    { el: $('hc2'), amp: 10, period: 3400, delay: 600  },
    { el: $('hc3'), amp: 7,  period: 2700, delay: 1200 },
  ];

  cards.forEach(({ el, amp, period, delay }) => {
    if(!el) return;
    let start = null;
    function animate(ts){
      if(!start) start = ts - delay;
      const t = (ts - start) / period;
      const y = amp * Math.sin(2 * Math.PI * t);
      const r = el.classList.contains('hcard-1') ? -4 + 0.8 * Math.sin(2*Math.PI*t) :
                el.classList.contains('hcard-2') ? 5  - 0.8 * Math.sin(2*Math.PI*t) : 2 + 0.5*Math.sin(2*Math.PI*t);
      el.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  });
}

/* ── Parallax hero background ───────────────────────────────── */
function setupParallax(){
  const hero = document.querySelector('.hero');
  if(!hero) return;
  const copy = hero.querySelector('.hero-copy');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const scrollY = window.scrollY;
      if(scrollY > 600) return;
      hero.style.backgroundPositionY = `${scrollY * 0.3}px`;
      if(copy) copy.style.transform = `translateY(${scrollY * 0.08}px)`;
    });
  }, { passive: true });
}

/* ── Navbar scroll behaviour ────────────────────────────────── */
function setupNavScroll(){
  const header = document.querySelector('header.site');
  if(!header) return;
  let scrolled = false, ticking = false;
  window.addEventListener('scroll', () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const now = window.scrollY > 80;
      if(now === scrolled) return;           // only touch the header when it actually changes
      scrolled = now;
      header.style.boxShadow = now ? '0 4px 24px rgba(0,0,0,0.4)' : '';
      header.style.borderBottomColor = now ? 'rgba(2,245,161,0.2)' : '';
    });
  }, { passive: true });
  header.style.transition = 'box-shadow 0.3s ease, border-bottom-color 0.3s ease';
}

/* ── Active nav link highlight on scroll ────────────────────── */
function setupActiveNavLinks(){
  const sections = document.querySelectorAll('section[id], div[id="delivery"]');
  const links    = document.querySelectorAll('nav.links a');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        links.forEach(a => {
          a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
          if(a.classList.contains('nav-active')){
            a.style.color = 'var(--mint)';
          } else {
            a.style.color = '';
          }
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
}

/* ── Counter animation for hero stats ──────────────────────── */
function animateCounter(el, target, duration = 1800){
  const start = performance.now();
  const startVal = 0;
  const isFloat = String(target).includes('.');

  function update(now){
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (target - startVal) * eased;
    el.textContent = isFloat ? current.toFixed(1) : Math.round(current).toLocaleString();
    if(progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function setupCounters(){
  const stats = document.querySelectorAll('.hero-stats .stat b');
  const counters = [
    { el: stats[0], target: PRODUCE.length + LIVESTOCK.length },   // products (live count)
    { el: stats[2], target: 24 },   // hrs
  ];

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        counters.forEach(c => { if(c.el) animateCounter(c.el, c.target); });
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  if(stats[0]) obs.observe(stats[0]);
}

/* ── Ripple effect on buttons ───────────────────────────────── */
function addRipple(btn){
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position:absolute; border-radius:50%; background:rgba(2,245,161,0.3);
    transform:scale(0); animation:rippleAnim 0.5s ease-out forwards;
    width:80px; height:80px; left:50%; top:50%;
    margin:-40px 0 0 -40px; pointer-events:none;
  `;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

/* ── Page-load entrance animation ──────────────────────────── */
function pageLoadAnimation(){
  const header   = document.querySelector('header.site');
  const topstrip = document.querySelector('.topstrip');
  const heroCopy = document.querySelector('.hero-copy');
  const heroVis  = document.querySelector('.hero-visual');

  [topstrip, header].forEach(el => {
    if(!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-20px)';
  });

  if(heroCopy){
    heroCopy.style.opacity = '0';
    heroCopy.style.transform = 'translateX(-16px)';
  }
  if(heroVis){
    heroVis.style.opacity = '0';
    heroVis.style.transform = 'translateX(16px)';
  }

  // Animate in (quick: everything is visible within ~0.3s)
  requestAnimationFrame(() => {
    const fadeIn = (el, delay) => {
      if(!el) return;
      setTimeout(() => {
        el.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
        el.style.opacity    = '1';
        el.style.transform  = 'none';
      }, delay);
    };
    fadeIn(topstrip, 0);
    fadeIn(header, 20);
    fadeIn(heroCopy, 40);
    fadeIn(heroVis, 60);
  });
}

/* ── Smooth scroll for anchor links ────────────────────────── */
function setupSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Image lazy‑load as they enter viewport ─────────────────── */
function setupLazyImages(){
  const imgObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const imgEl = entry.target;
      const key   = imgEl.dataset.img;
      if(key && window.IMG && window.IMG[key]){
        imgEl.style.transition = 'opacity 0.4s ease';
        imgEl.style.opacity    = '0';
        imgEl.src = window.IMG[key];
        imgEl.onload = () => { imgEl.style.opacity = '1'; };
      }
      imgObs.unobserve(imgEl);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-img]').forEach(el => imgObs.observe(el));
}

/* ──────────────────────────────────────────────────────────────
   12. INJECT GLOBAL CSS KEYFRAMES
────────────────────────────────────────────────────────────── */
function injectKeyframes(){
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform:scale(3); opacity:0; }
    }
    @keyframes fadeSlideUp {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes popIn {
      0%   { transform:scale(0.8); opacity:0; }
      70%  { transform:scale(1.05); }
      100% { transform:scale(1); opacity:1; }
    }
    @keyframes pulseGlow {
      0%,100% { box-shadow: 0 0 0 0 rgba(2,245,161,0.4); }
      50%     { box-shadow: 0 0 0 10px rgba(2,245,161,0); }
    }
    .cart-btn:focus{ animation: pulseGlow 1.5s ease 1; }
    .add-btn{ transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, background 0.2s ease; }
    .card{ transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), border-color 0.3s ease, box-shadow 0.3s ease; }
    .lga-chip{ transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease; }
    .lga-chip:hover{ transform: translateY(-2px) scale(1.03); }
    .tab-filter button{ transition: all 0.2s cubic-bezier(.34,1.56,.64,1); }
    .tab-filter button.active{ transform: scale(1.04); }
    .section-head h2{ position:relative; }
    .section-head h2::after{
      content:''; display:block; height:3px; border-radius:2px;
      background:linear-gradient(90deg, var(--mint), transparent);
      margin-top:8px; width:60px;
      animation: widthGrow 0.6s ease forwards;
    }
    @keyframes widthGrow{
      from{ width:0; } to{ width:60px; }
    }
    .how-card{ transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
    .how-card:hover{ transform: translateY(-6px); border-color: var(--mint); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(2,245,161,0.2); }
    .ins-card{ transition: transform 0.25s ease, border-color 0.25s ease; }
    .ins-card:hover{ transform: translateY(-4px); border-color: var(--mint); }
    .disabled-btn{ opacity:0.35; cursor:not-allowed; }
    nav.links a.nav-active::after{ transform:scaleX(1) !important; }
    nav.links a{ position:relative; }
    nav.links a::after{ content:''; position:absolute; left:0; right:0; bottom:-2px; height:2px; background:var(--mint); transform:scaleX(0); transition:transform 0.25s ease; }
    nav.links a:hover::after{ transform:scaleX(1); }
    .auth-modal{ animation: popIn 0.35s cubic-bezier(.16,1,.3,1) both; }
    .cart-line{ animation: fadeSlideUp 0.3s ease both; }
    .drawer-foot{ transition: opacity 0.3s ease; }
    .hero-badge{ animation: fadeSlideUp 0.8s ease 0.9s both; }
    .hero-eyebrow{ animation: fadeSlideUp 0.6s ease 0.3s both; }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────────────────────
   13. THEME TOGGLE (dark / light)
────────────────────────────────────────────────────────────── */
function toggleTheme(){
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('bm_theme', next); } catch {}
  const btn = $('themeBtn');
  btn?.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function setupThemeToggle(){
  const btn = $('themeBtn');
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  btn?.setAttribute('aria-label', current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  btn?.addEventListener('click', toggleTheme);
}

/* ──────────────────────────────────────────────────────────────
   14. MOBILE NAV
────────────────────────────────────────────────────────────── */
function setupMobileNav(){
  const navLinks = $('navLinks');
  const hambBtn  = $('hambBtn');

  hambBtn?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const open = navLinks.classList.contains('open');
    hambBtn.innerHTML = open
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hambBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
      document.body.style.overflow = '';
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   15. SEARCH
────────────────────────────────────────────────────────────── */
function setupSearch(){
  const inputs = ['searchInput', 'searchInputM'].map($).filter(Boolean);
  let debounce;
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      inputs.forEach(other => { if(other !== input) other.value = input.value; });
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchTerm = input.value.trim();
        renderProduce();
        renderLivestock();
      }, 250);
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   16. LOAD IMAGES FOR STATIC ELEMENTS
────────────────────────────────────────────────────────────── */
function loadStaticImages(){
  // Hero ticket cards
  document.querySelectorAll('[data-img]').forEach(el => {
    const key = el.dataset.img;
    if(key && window.IMG && window.IMG[key]){
      if(el.tagName === 'IMG'){
        el.src = window.IMG[key];
        el.style.opacity = '1';
      }
    }
  });
}

/* ──────────────────────────────────────────────────────────────
   17. MAIN INIT
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  // Inject CSS keyframes first
  injectKeyframes();

  // Restore session
  currentUser = loadSession();
  updateAuthUI();
  syncCustomerToAdmin(); // reflect this visit in the admin dashboard's User Management, if signed in

  // Theme
  setupThemeToggle();

  // Page-load animation
  pageLoadAnimation();

  // Draw the shop straight away from the built-in catalogue (no waiting on the network)...
  // Render catalogues
  renderProduce();
  renderLivestock();
  renderCart();
  renderAnnouncements();

  // Load images
  loadStaticImages();

  // Cart events
  $('cartOpenBtn')?.addEventListener('click', openCart);
  $('checkoutBtn')?.addEventListener('click', openCheckout);

  // My Orders
  $('myOrdersBtn')?.addEventListener('click', openOrderHistory);
  $('ordersHistoryOverlay')?.addEventListener('click', e => {
    if(e.target === $('ordersHistoryOverlay')) closeOrderHistory();
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      closeCheckoutModal();
      closeOrderHistory();
      closeProduct();
      const navLinks = $('navLinks');
      if(navLinks?.classList.contains('open')){
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  // Filters
  wireFilters('produceFilters', f => { pFilter = f; renderProduce(); });
  wireFilters('livestockFilters', f => { lFilter = f; renderLivestock(); });

  // Search
  setupSearch();

  // Scroll & animation effects
  setupRevealObserver();
  setupHeroFloats();
  setupParallax();
  setupNavScroll();
  setupActiveNavLinks();
  setupCounters();
  setupSmoothScroll();
  setupMobileNav();

  // Lazy images for static data-img elements
  setupLazyImages();

  // Cart overlay click-to-close
  $('cartOverlay')?.addEventListener('click', closeCart);

  // Trust strip — animate in as the page loads
  setTimeout(() => {
    document.querySelectorAll('.trust-item').forEach((el, i) => {
      el.style.transition = `opacity 0.3s ease ${i*0.04}s, transform 0.3s ease ${i*0.04}s`;
    });
  }, 0);

  // ...and in the background ask server.js for the live catalogue; only redraw if something actually changed.
  bootServer().then(changed => {
    if(!changed) return;
    renderProduce();
    renderLivestock();
    renderCart();
  });

});

/* ──────────────────────────────────────────────────────────────
   17B. PRODUCT DETAIL (zoomable picture + live/processed + kg)
────────────────────────────────────────────────────────────── */
function closeProduct(){
  $('productOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function openProduct(id){
  const item = findBase(id);
  if(!item) return;
  const modes   = item.modes ? Object.keys(item.modes) : [];
  const measures = item.measures || [];
  const kind    = PRODUCE.includes(item) ? 'produce' : 'livestock';

  let overlay = $('productOverlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'productOverlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal" id="productModal"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if(e.target === overlay) closeProduct(); });
  }

  $('productModal').innerHTML = `
    <div class="modal-head">
      <h3>${esc(item.name)}</h3>
      <button type="button" id="pdClose">×</button>
    </div>
    <div class="modal-body">
      <div class="pd-zoom" id="pdZoom">${img(item.img, item.name, true)}</div>
      <div class="pd-zoombar">
        <button type="button" id="pdOut">− Zoom out</button>
        <button type="button" id="pdIn">Zoom in +</button>
      </div>
      <p class="pd-desc">${esc(item.desc)}</p>
      <p class="pd-unit" style="font-size:13px;color:var(--text-dim);margin:-4px 0 10px;">${naira(item.price)} per ${esc(unitName(item))} \u00b7 ${item.stock > 0 ? `${item.stock} ${esc(unitName(item, item.stock))} available` : 'sold out'}</p>
      ${modes.length ? `<div class="field"><label>How would you like it?</label>
        <select id="pdMode">${modes.map(m => `<option value="${m}">${m === 'live' ? 'Live' : 'Processed (dressed)'} — ${naira(item.modes[m])} per kg</option>`).join('')}</select></div>` : ''}
      ${measures.length ? `<div class="field"><label>How do you want to buy it?</label>
        <select id="pdMeasure"></select></div>` : ''}
      <div class="field"><label>Quantity</label>
        <div class="stepper"><button type="button" id="pdMinus">−</button><span class="qv" id="pdQty">1</span><button type="button" id="pdPlus">+</button></div>
      </div>
      <div class="pd-total">Total: <b id="pdTotal"></b></div>
      <button type="button" class="checkout-btn" id="pdAdd" ${item.stock === 0 ? 'disabled' : ''}>${item.stock === 0 ? 'Sold out' : 'Add to cart'}</button>
    </div>`;

  let qty = 1;
  let zoom = 1;
  const unitPriceNow = () => { const mo = $('pdMode') ? $('pdMode').value : null; return (mo && item.modes && item.modes[mo]) || item.price; };
  const picked = () => {
    const key = $('pdMeasure') ? $('pdMeasure').value : '';
    const m = measures.find(x => x.key === key) || null;
    return { mode: $('pdMode') ? $('pdMode').value : null, key, per: m ? m.qty : 1 };
  };
  // the "how do you want to buy it?" list shows each way with its price (it changes with live/processed)
  const fillMeasures = () => {
    const sel = $('pdMeasure'); if(!sel) return;
    const keep = sel.value;
    sel.innerHTML = measures.map(m => `<option value="${esc(m.key)}">${esc(m.label)} \u2014 ${naira(U.priceFor(unitPriceNow(), m.qty))}</option>`).join('');
    if(keep && measures.some(m => m.key === keep)) sel.value = keep;
  };
  const maxQty = () => Math.max(1, Math.floor(item.stock / picked().per));
  const refresh = () => {
    const { per } = picked();
    qty = clamp(qty, 1, maxQty());
    $('pdQty').textContent = qty;
    $('pdTotal').textContent = naira(U.priceFor(unitPriceNow(), per) * qty);
  };
  const setZoom = z => {
    zoom = clamp(z, 1, 4);
    const pic = document.querySelector('#pdZoom img');
    if(pic) pic.style.width = (zoom * 100) + '%';
  };

  $('pdClose').addEventListener('click', closeProduct);
  $('pdIn').addEventListener('click', () => setZoom(zoom + 0.5));
  $('pdOut').addEventListener('click', () => setZoom(zoom - 0.5));
  document.querySelector('#pdZoom img')?.addEventListener('click', () => setZoom(zoom > 1 ? 1 : 2));
  $('pdMinus').addEventListener('click', () => { qty--; refresh(); });
  $('pdPlus').addEventListener('click', () => { qty++; refresh(); });
  $('pdMode')?.addEventListener('change', () => { fillMeasures(); refresh(); });
  $('pdMeasure')?.addEventListener('change', refresh);
  $('pdAdd').addEventListener('click', () => {
    if(!currentUser){
      showToast('Please log in or sign up to add items to cart', 'error');
      setTimeout(goToAuth, 250);
      return;
    }
    const { mode, key } = picked();
    addToCart(hasOpts(item) ? lineId(item.id, mode, key) : item.id, kind, qty);
    closeProduct();
  });

  fillMeasures();
  refresh();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ──────────────────────────────────────────────────────────────
   17C. ANNOUNCEMENTS (admin "broadcast" notifications)
────────────────────────────────────────────────────────────── */
async function loadAnnouncements(){
  if(SERVER){
    try { return (await api('GET', '/announcements')).items; } catch {}
  }
  try {
    const db = loadAdminDB();
    return (db.notifications || [])
      .filter(n => n.type === 'broadcast')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  } catch { return []; }
}

async function renderAnnouncements(){
  const box = $('annList');
  if(!box) return;
  const list = await loadAnnouncements();
  box.innerHTML = list.length
    ? list.map(n => `
        <article class="ann-card">
          <div class="ann-date">${new Date(n.createdAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</div>
          <h3>${esc(n.title)}</h3>
          ${n.message ? `<p>${esc(n.message)}</p>` : ''}
        </article>`).join('')
    : '<p class="ann-empty">No announcements right now — check back soon.</p>';
}

/* ──────────────────────────────────────────────────────────────
   17D. SERVER CONNECTION
   If server.js is running, prices / stock / what is published come from
   the database (so the admin dashboard controls the shop). If not, the
   built-in catalogue above is used and everything works as before.
────────────────────────────────────────────────────────────── */
function applyServerCatalog(items){
  const bySku = new Map();
  const extras = [];
  items.filter(p => p.category !== 'insurance').forEach(p => (p.sku ? bySku.set(p.sku, p) : extras.push(p)));

  const sync = list => {
    for(let i = list.length - 1; i >= 0; i--){
      const base = list[i];
      const row  = bySku.get(base.id);
      if(!row){ list.splice(i, 1); continue; }     // unpublished or deleted in the dashboard
      // Everything the admin can edit in Content (name, unit, price, stock, group, pack sizes, processed price).
      base.price = row.price;
      base.stock = row.stock;
      if(row.name)        base.name = row.name;
      if(row.unit)        base.unit = row.unit;
      if(row.description) base.desc = row.description;
      if(row.subcategory) base.category = row.subcategory;
      base.measures = (row.measures && row.measures.length) ? row.measures : undefined;   // the ways to buy it, from the database
      base.modes   = row.processedPrice ? { live: row.price, processed: row.processedPrice } : undefined;
    }
  };
  sync(PRODUCE);
  sync(LIVESTOCK);

  // Items added from the admin dashboard have no built-in entry yet.
  extras.forEach(p => {
    const entry = {
      id: 's-' + p.id, sid: p.id, name: p.name, unit: p.unit || 'unit', price: p.price, stock: p.stock,
      img: p.imageKey || String(p.imageUrl || '').split('/').pop().replace(/\.[a-z]+$/, '') || 'default', desc: p.description || '',
      category: p.subcategory || (p.category === 'livestock' ? 'livestock' : 'vegetables')
    };
    if(p.measures && p.measures.length) entry.measures = p.measures;
    if(p.processedPrice) entry.modes = { live: p.price, processed: p.processedPrice };
    (p.category === 'livestock' ? LIVESTOCK : PRODUCE).push(entry);
  });
}

async function bootServer(){
  try {
    // One round trip, both requests in parallel (no separate health check). No server / Live Server -> the request fails and we keep the built-in catalogue.
    const [config, products] = await Promise.all([api('GET', '/config'), api('GET', '/products')]);
    const before = JSON.stringify([PRODUCE, LIVESTOCK, DELIVERY, DELIVERY_STATES]);
    SERVER = true;
    if(config.deliveryBase) DELIVERY = config.deliveryBase;
    if(config.deliveryStates && config.deliveryStates.length) DELIVERY_STATES = config.deliveryStates;
    applyServerCatalog(products.items);
    api('POST', '/visit').catch(() => {});
    return before !== JSON.stringify([PRODUCE, LIVESTOCK, DELIVERY, DELIVERY_STATES]);
  } catch { /* no server: keep the built-in catalogue and browser-only storage */ return false; }
}

/* ──────────────────────────────────────────────────────────────
   18. EXPOSE GLOBALS (for inline HTML event hooks)
────────────────────────────────────────────────────────────── */
window.goToAuth       = goToAuth;
window.openCart       = openCart;
window.openProduct    = openProduct;
window.closeCart      = closeCart;