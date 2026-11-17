/* ==========================================================================
   BuildKart — Editable Product Catalog, Store Settings & Grade Guide
   ==========================================================================
   HOW TO EDIT THIS FILE:
   1. Change your WhatsApp phone number and UPI ID inside STORE_CONFIG below.
      - Use country code 91 + 10-digit mobile number with NO "+" or spaces.
      - Example: "919876543210"
   2. Add, remove, or edit products inside the PRODUCTS array below.
   3. Keep each product "id" unique (1, 2, 3, ...).
   ========================================================================== */

var STORE_CONFIG = {
  storeName: "BuildKart",
  whatsappNumber: "919876543210", // <-- REPLACE WITH YOUR WHATSAPP NUMBER
  upiId: "buildkart@upi",           // <-- REPLACE WITH YOUR REAL UPI ID
  upiQrImage: "images/upi-qr-placeholder.svg", // <-- REPLACE WITH YOUR QR IMAGE PATH
  supportPhoneDisplay: "+91 98765 43210",
  supportEmail: "orders@buildkart.in",
  dispatchHours: "Mon – Sat · 7:00 AM to 8:00 PM",
  warehouseCity: "Bengaluru & Pan-Metro Site Delivery",
  adminPasscode: "4545"             // <-- CHANGE DEFAULT ADMIN PASSCODE HERE OR IN ADMIN SETTINGS
};

/* ==========================================================================
   20 CURATED CONSTRUCTION MATERIALS ACROSS CEMENT, STEEL, BRICKS & SAND
   ========================================================================== */
var PRODUCTS = [
  // --- CEMENT (5 Products) ---
  {
    id: 1,
    name: "UltraTech OPC 53 Grade Cement",
    brand: "UltraTech",
    category: "Cement",
    unit: "50 kg Bag",
    price: 425,
    minOrder: 10,
    gradeSpec: "OPC 53 · High Early Strength",
    featured: true,
    inStock: true,
    image: "images/cement.jpg",
    alt: "Stacked 50 kg kraft bags of UltraTech OPC 53 grade cement for structural concrete",
    description: "High-strength Ordinary Portland Cement engineered for RCC slabs, columns, beams, and heavy precast structures requiring rapid early setting.",
    specs: {
      "Grade Standard": "IS 269 (OPC 53)",
      "Pack Weight": "50 kg moisture-proof bag",
      "28-Day Strength": "Min 53 MPa",
      "Recommended Use": "RCC columns, beams, roof slabs",
      "Minimum Order": "10 Bags"
    }
  },
  {
    id: 2,
    name: "ACC Gold Water Shield Cement",
    brand: "ACC",
    category: "Cement",
    unit: "50 kg Bag",
    price: 445,
    minOrder: 10,
    gradeSpec: "PPC · Water-Repellent Formula",
    featured: false,
    inStock: true,
    image: "images/cement.jpg",
    alt: "50 kg bags of ACC water-resistant construction cement stacked on concrete",
    description: "Damp-resistant blended cement designed for foundations, basements, overhead tanks, and exterior plaster exposed to monsoon moisture.",
    specs: {
      "Grade Standard": "IS 1489 (Part 1) PPC",
      "Pack Weight": "50 kg tamper-proof bag",
      "Special Property": "Hydrophobic pore blocking",
      "Recommended Use": "Foundations, damp-prone walls, roofs",
      "Minimum Order": "10 Bags"
    }
  },
  {
    id: 3,
    name: "Ambuja Plus Cool Walls Cement",
    brand: "Ambuja",
    category: "Cement",
    unit: "50 kg Bag",
    price: 410,
    minOrder: 10,
    gradeSpec: "PPC · Smooth Finish Masonry",
    featured: true,
    inStock: true,
    image: "images/cement.jpg",
    alt: "50 kg Ambuja PPC cement bags ready for masonry and plastering",
    description: "Micro-fine Pozzolana cement providing superior workability, crack-free plastering, and dense concrete finish for residential and commercial sites.",
    specs: {
      "Grade Standard": "IS 1489 PPC",
      "Pack Weight": "50 kg bag",
      "Initial Setting": "Min 30 minutes",
      "Recommended Use": "Brickwork, plastering, general RCC",
      "Minimum Order": "10 Bags"
    }
  },
  {
    id: 4,
    name: "Dalmia DSP Dhalai Special Cement",
    brand: "Dalmia",
    category: "Cement",
    unit: "50 kg Bag",
    price: 435,
    minOrder: 20,
    gradeSpec: "DSP · High-Density Slab Grade",
    featured: false,
    inStock: true,
    image: "images/cement.jpg",
    alt: "Dalmia DSP structural slab cement 50 kg bags",
    description: "Formulated specifically for roof casting (dhalai) and heavy load-bearing footings with low heat of hydration and dense compaction.",
    specs: {
      "Grade Standard": "High-Strength Composite",
      "Pack Weight": "50 kg laminated bag",
      "Compressive Gain": "Dense low-permeability matrix",
      "Recommended Use": "Roof slabs, footings, retaining walls",
      "Minimum Order": "20 Bags"
    }
  },
  {
    id: 5,
    name: "JK Super OPC 43 Grade Cement",
    brand: "JK Super",
    category: "Cement",
    unit: "50 kg Bag",
    price: 385,
    minOrder: 10,
    gradeSpec: "OPC 43 · Everyday Masonry",
    featured: false,
    inStock: true,
    image: "images/cement.jpg",
    alt: "JK Super OPC 43 grade cement 50 kg bags",
    description: "Reliable everyday OPC 43 grade cement ideal for general masonry, floor screeds, paving blocks, and residential plastering.",
    specs: {
      "Grade Standard": "IS 269 (OPC 43)",
      "Pack Weight": "50 kg bag",
      "28-Day Strength": "Min 43 MPa",
      "Recommended Use": "Plastering, brickwork, flooring",
      "Minimum Order": "10 Bags"
    }
  },

  // --- STEEL (5 Products) ---
  {
    id: 6,
    name: "Tata Tiscon 550SD TMT Bar (12mm)",
    brand: "Tata Tiscon",
    category: "Steel",
    unit: "Per Metric Ton",
    price: 72500,
    minOrder: 1,
    gradeSpec: "Fe-550D · 12mm Diameter",
    featured: true,
    inStock: true,
    image: "images/steel.jpg",
    alt: "Bundled 12mm Tata Tiscon Fe-550D ribbed TMT steel bars on concrete",
    description: "Seismic-resistant Super Ductile Fe-550D 12mm TMT rebars with uniform rib pattern for high concrete bond strength in beams and slabs.",
    specs: {
      "Steel Grade": "Fe-550D (IS 1786)",
      "Diameter": "12 mm (12m standard length)",
      "Weight per Meter": "0.888 kg/m",
      "Yield Strength": "Min 550 N/mm2",
      "Minimum Order": "1 Metric Ton"
    }
  },
  {
    id: 7,
    name: "JSW Neosteel Fe-550D TMT Bar (16mm)",
    brand: "JSW Neosteel",
    category: "Steel",
    unit: "Per Metric Ton",
    price: 71800,
    minOrder: 1,
    gradeSpec: "Fe-550D · 16mm Heavy Column",
    featured: true,
    inStock: true,
    image: "images/steel.jpg",
    alt: "16mm JSW Neosteel Fe-550D TMT steel rebar bundle",
    description: "Pure virgin iron-ore TMT steel 16mm bars engineered for multi-storey columns, plinth beams, and heavy load-bearing structural frames.",
    specs: {
      "Steel Grade": "Fe-550D (Pure Steel)",
      "Diameter": "16 mm (12m standard length)",
      "Weight per Meter": "1.580 kg/m",
      "Elongation": "Min 14.5%",
      "Minimum Order": "1 Metric Ton"
    }
  },
  {
    id: 8,
    name: "Jindal Panther Fe-550D TMT Bar (10mm)",
    brand: "Jindal Panther",
    category: "Steel",
    unit: "Per Metric Ton",
    price: 71200,
    minOrder: 1,
    gradeSpec: "Fe-550D · 10mm Slab Mesh",
    featured: false,
    inStock: true,
    image: "images/steel.jpg",
    alt: "10mm Jindal Panther TMT reinforcement steel bars",
    description: "High-bendability 10mm TMT steel bars ideal for roof slab distribution mesh, lintels, sunshades, and staircase reinforcement.",
    specs: {
      "Steel Grade": "Fe-550D",
      "Diameter": "10 mm (12m standard length)",
      "Weight per Meter": "0.617 kg/m",
      "Recommended Use": "Slabs, lintels, secondary beams",
      "Minimum Order": "1 Metric Ton"
    }
  },
  {
    id: 9,
    name: "Kamdhenu Nxt Fe-500D Rings Steel (8mm)",
    brand: "Kamdhenu",
    category: "Steel",
    unit: "Per 100 kg Bundle",
    price: 6850,
    minOrder: 2,
    gradeSpec: "Fe-500D · 8mm Stirrups & Rings",
    featured: false,
    inStock: true,
    image: "images/steel.jpg",
    alt: "8mm TMT steel stirrup reinforcement bundle",
    description: "Flexible 8mm Fe-500D bars packed in handy 100 kg site bundles for effortless bending into column stirrups and beam rings without cracking.",
    specs: {
      "Steel Grade": "Fe-500D",
      "Diameter": "8 mm",
      "Weight per Meter": "0.395 kg/m",
      "Recommended Use": "Stirrups, ties, slab mesh",
      "Minimum Order": "2 Bundles (200 kg)"
    }
  },
  {
    id: 10,
    name: "Shyam Steel Fe-550D Heavy Bar (20mm)",
    brand: "Shyam Steel",
    category: "Steel",
    unit: "Per Metric Ton",
    price: 74500,
    minOrder: 1,
    gradeSpec: "Fe-550D · 20mm Foundation & Pile",
    featured: false,
    inStock: true,
    image: "images/steel.jpg",
    alt: "20mm heavy structural TMT steel reinforcement bars",
    description: "Heavy-gauge 20mm TMT steel designed for deep pile foundations, commercial raft slabs, and multi-floor structural columns.",
    specs: {
      "Steel Grade": "Fe-550D",
      "Diameter": "20 mm (12m standard length)",
      "Weight per Meter": "2.469 kg/m",
      "Recommended Use": "Deep foundations, commercial columns",
      "Minimum Order": "1 Metric Ton"
    }
  },

  // --- BRICKS & BLOCKS (5 Products) ---
  {
    id: 11,
    name: "Class-A Kiln Fired Red Clay Bricks",
    brand: "BuildKart Verified",
    category: "Bricks",
    unit: "Per 1,000 Bricks",
    price: 8200,
    minOrder: 2,
    gradeSpec: "Class-A · 230 x 110 x 75 mm",
    featured: true,
    inStock: true,
    image: "images/bricks.jpg",
    alt: "Uniform kiln-fired terracotta red clay building bricks stacked neatly",
    description: "Hard-burnt, ringing-tone Class-A red clay bricks with sharp edges, low water absorption, and consistent dimensions for load-bearing walls.",
    specs: {
      "Dimensions": "230 x 110 x 75 mm",
      "Compressive Strength": "7.5 – 10 N/mm2",
      "Water Absorption": "Under 15%",
      "Coverage": "~500 bricks per cubic meter",
      "Minimum Order": "2,000 Bricks (2 Units)"
    }
  },
  {
    id: 12,
    name: "Magicrete AAC Lightweight Blocks (4 inch)",
    brand: "Magicrete",
    category: "Bricks",
    unit: "Per Cubic Meter (CBM)",
    price: 4150,
    minOrder: 5,
    gradeSpec: "100 mm Partition · 600x200x100mm",
    featured: true,
    inStock: true,
    image: "images/bricks.jpg",
    alt: "Lightweight grey AAC concrete wall blocks next to clay bricks",
    description: "Precision-cut 4-inch Autoclaved Aerated Concrete blocks that reduce dead load by 60% and speed up interior partition wall construction.",
    specs: {
      "Block Size": "600 x 200 x 100 mm",
      "Blocks per CBM": "83 Blocks",
      "Dry Density": "550 – 650 kg/m3",
      "Fire Rating": "4 Hours",
      "Minimum Order": "5 CBM"
    }
  },
  {
    id: 13,
    name: "Siporex AAC Structural Blocks (6 inch)",
    brand: "Siporex",
    category: "Bricks",
    unit: "Per Cubic Meter (CBM)",
    price: 4350,
    minOrder: 5,
    gradeSpec: "150 mm Exterior · 600x200x150mm",
    featured: false,
    inStock: true,
    image: "images/bricks.jpg",
    alt: "6-inch Siporex AAC exterior thermal wall blocks",
    description: "Thermal-insulating 6-inch AAC blocks ideal for exterior walls, offering sound dampening and 3x faster masonry compared to clay bricks.",
    specs: {
      "Block Size": "600 x 200 x 150 mm",
      "Blocks per CBM": "55 Blocks",
      "Compressive Strength": "4.0 MPa",
      "Recommended Use": "Exterior walls, commercial facades",
      "Minimum Order": "5 CBM"
    }
  },
  {
    id: 14,
    name: "High-Strength Fly Ash Bricks",
    brand: "BuildKart Verified",
    category: "Bricks",
    unit: "Per 1,000 Bricks",
    price: 6900,
    minOrder: 2,
    gradeSpec: "Vibro-Pressed · Smooth Finish",
    featured: false,
    inStock: true,
    image: "images/bricks.jpg",
    alt: "Uniform grey vibro-pressed fly ash construction bricks",
    description: "Eco-friendly machine-pressed fly ash bricks with smooth faces that cut mortar consumption and reduce plaster thickness by up to 20%.",
    specs: {
      "Dimensions": "230 x 110 x 75 mm",
      "Compressive Strength": "8.0 – 10.0 N/mm2",
      "Water Absorption": "10 – 12%",
      "Recommended Use": "Compound walls, apartment masonry",
      "Minimum Order": "2,000 Bricks"
    }
  },
  {
    id: 15,
    name: "Solid Concrete Hollow Blocks (8 inch)",
    brand: "BuildKart Verified",
    category: "Bricks",
    unit: "Per 100 Blocks",
    price: 5400,
    minOrder: 2,
    gradeSpec: "400 x 200 x 200 mm · Heavy Duty",
    featured: false,
    inStock: true,
    image: "images/bricks.jpg",
    alt: "Heavy-duty 8-inch solid concrete masonry blocks",
    description: "High-density 8-inch concrete blocks built for boundary walls, warehouse bays, basements, and heavy industrial partitions.",
    specs: {
      "Dimensions": "400 x 200 x 200 mm",
      "Block Weight": "19 – 21 kg each",
      "Compressive Strength": "5.0+ MPa",
      "Recommended Use": "Boundary walls, industrial sheds",
      "Minimum Order": "200 Blocks (2 Units)"
    }
  },

  // --- SAND & AGGREGATES (5 Products) ---
  {
    id: 16,
    name: "Double-Washed Concrete M-Sand (Zone II)",
    brand: "BuildKart Quarry",
    category: "Sand",
    unit: "Per Metric Ton",
    price: 1180,
    minOrder: 10,
    gradeSpec: "IS 383 Zone II · Zero Silt",
    featured: true,
    inStock: true,
    image: "images/sand.jpg",
    alt: "Clean washed grey M-Sand and fine river sand piles on concrete",
    description: "Cubical crushed granite M-Sand washed twice to eliminate micro-fines and silt, delivering maximum compressive strength in RCC concrete mixes.",
    specs: {
      "Grading Standard": "IS 383 Zone II",
      "Particle Size": "0 – 4.75 mm",
      "Silt Content": "Less than 2%",
      "Recommended Use": "RCC slabs, beams, Ready-Mix Concrete",
      "Minimum Order": "10 Metric Tons (1 Tipper Load)"
    }
  },
  {
    id: 17,
    name: "Fine Plastering P-Sand (Sieved)",
    brand: "BuildKart Quarry",
    category: "Sand",
    unit: "Per Metric Ton",
    price: 1320,
    minOrder: 10,
    gradeSpec: "0 – 2.36 mm · Smooth Wall Finish",
    featured: false,
    inStock: true,
    image: "images/sand.jpg",
    alt: "Fine graded P-Sand for smooth wall plastering",
    description: "Ultra-fine, clay-free plastering sand graded under 2.36 mm for effortless trowel spread and crack-free interior and exterior wall finishes.",
    specs: {
      "Grading Standard": "IS 1542 Plastering Grade",
      "Particle Size": "0 – 2.36 mm",
      "Moisture": "Controlled washed output",
      "Recommended Use": "Internal/external wall plaster, brick mortar",
      "Minimum Order": "10 Metric Tons"
    }
  },
  {
    id: 18,
    name: "Screened Natural River Sand",
    brand: "BuildKart Verified",
    category: "Sand",
    unit: "Per 100 Cubic Ft (Brass)",
    price: 6800,
    minOrder: 1,
    gradeSpec: "Natural Washed · Fine Golden",
    featured: false,
    inStock: true,
    image: "images/sand.jpg",
    alt: "Clean screened natural golden river sand mound",
    description: "Clean screened natural river sand prized by masons for ultra-smooth putty-ready plastering, tile bedding, and architectural finishes.",
    specs: {
      "Unit Volume": "100 Cubic Ft (1 Brass)",
      "Silt / Organic": "Screened & washed",
      "Texture": "Rounded natural silica grains",
      "Recommended Use": "Plastering, tile mortar, finishing",
      "Minimum Order": "100 Cubic Ft (1 Unit)"
    }
  },
  {
    id: 19,
    name: "20mm Crushed Granite Aggregate (Jelly)",
    brand: "BuildKart Quarry",
    category: "Sand",
    unit: "Per Metric Ton",
    price: 940,
    minOrder: 10,
    gradeSpec: "20 mm Angular · RCC Coarse",
    featured: false,
    inStock: true,
    image: "images/sand.jpg",
    alt: "Crushed 20mm grey granite coarse aggregate stone chips",
    description: "Hard angular 20mm blue-metal granite jelly free of flaky stones and dust, engineered for M20, M25, and M30 structural concrete.",
    specs: {
      "Aggregate Size": "20 mm nominal",
      "Crushing Value": "< 22% (Heavy Duty)",
      "Flakiness Index": "< 15%",
      "Recommended Use": "Footings, columns, roof slabs",
      "Minimum Order": "10 Metric Tons"
    }
  },
  {
    id: 20,
    name: "12mm Baby Jelly Crushed Aggregate",
    brand: "BuildKart Quarry",
    category: "Sand",
    unit: "Per Metric Ton",
    price: 990,
    minOrder: 10,
    gradeSpec: "12 mm · Dense Rebar Pouring",
    featured: false,
    inStock: true,
    image: "images/sand.jpg",
    alt: "12mm fine crushed granite aggregate for dense concrete pours",
    description: "Cleanly graded 12mm baby jelly ideal for congested steel reinforcement zones, precast lintels, paver beds, and thin concrete toppings.",
    specs: {
      "Aggregate Size": "12 mm nominal",
      "Dust Content": "Dry-screened low dust",
      "Recommended Use": "Dense RCC joints, floor screeds, lintels",
      "Minimum Order": "10 Metric Tons"
    }
  }
];

/* ==========================================================================
   MATERIAL GRADE & SIZE GUIDE DATA (Interactive Contractor Reference)
   ========================================================================== */
var GRADE_GUIDE = {
  steel: {
    title: "TMT Steel Bar Size & Grade Reference (IS 1786)",
    summary: "Quick weight-per-meter and application chart for Fe-500D and Fe-550D reinforcement steel bars (standard 12m bar length).",
    headers: ["Diameter", "Weight / Meter", "Weight / 12m Bar", "Bars / Metric Ton", "Primary Site Application"],
    rows: [
      ["8 mm", "0.395 kg/m", "4.74 kg", "~210 bars", "Column stirrups, beam rings, slab distribution"],
      ["10 mm", "0.617 kg/m", "7.40 kg", "~135 bars", "Residential roof slabs, lintels, staircases"],
      ["12 mm", "0.888 kg/m", "10.66 kg", "~93 bars", "Main slab bars, beams, small residential columns"],
      ["16 mm", "1.580 kg/m", "18.96 kg", "~52 bars", "Multi-storey columns, plinth beams, heavy frames"],
      ["20 mm", "2.469 kg/m", "29.63 kg", "~33 bars", "Commercial columns, pile caps, raft foundations"]
    ]
  },
  cement: {
    title: "Cement Grade Selection Guide (OPC vs PPC)",
    summary: "Match the right cement grade to your concrete curing schedule, structural load, and weather exposure.",
    headers: ["Cement Grade", "IS Standard", "28-Day Strength", "Setting Speed", "Best Used For"],
    rows: [
      ["OPC 53 Grade", "IS 269", "53+ MPa", "Fast early gain", "RCC slabs, columns, beams, prestressed concrete"],
      ["OPC 43 Grade", "IS 269", "43+ MPa", "Moderate", "Brick masonry, plastering, floor screeds, tiles"],
      ["PPC (Blended)", "IS 1489", "43–53+ MPa", "Low heat gain", "Foundations, damp-prone areas, exterior plaster"],
      ["DSP / Water Shield", "Composite", "50+ MPa", "Dense matrix", "Roof dhalai, water tanks, basements, coastal zones"]
    ]
  },
  bricks: {
    title: "Bricks & AAC Blocks Size & Coverage Chart",
    summary: "Compare wall weight, dimensions, and approximate unit count per 100 sq. ft. of 9-inch or 6-inch masonry.",
    headers: ["Material Type", "Standard Size", "Per 100 Sq. Ft.", "Wall Load", "Key Advantage"],
    rows: [
      ["Red Clay Brick (Class A)", "230 x 110 x 75 mm", "~950 bricks (9\" wall)", "Heavy", "Traditional high compressive load bearing"],
      ["Fly Ash Brick", "230 x 110 x 75 mm", "~920 bricks (9\" wall)", "Heavy", "Smooth surface saves up to 20% plaster mortar"],
      ["AAC Block (4 inch)", "600 x 200 x 100 mm", "~78 blocks", "Ultra Light", "Fast interior partitions, zero structural overload"],
      ["AAC Block (6 inch)", "600 x 200 x 150 mm", "~78 blocks", "Lightweight", "High thermal & sound insulation for outer walls"]
    ]
  },
  sand: {
    title: "Sand & Aggregate Grading Guide (IS 383)",
    summary: "Choose the right particle size and silt tolerance for concrete pouring vs. smooth plastering.",
    headers: ["Material", "Particle Size", "Max Silt Limit", "Unit Conversion", "Best Used For"],
    rows: [
      ["Concrete M-Sand", "0 – 4.75 mm", "< 3% (Washed)", "1 Ton ≈ 22 CFT", "High-strength RCC slabs, beams, foundations"],
      ["Plastering P-Sand", "0 – 2.36 mm", "< 2% (Sieved)", "1 Ton ≈ 23 CFT", "Crack-free interior and exterior wall plaster"],
      ["River Sand", "0 – 4.75 mm", "Screened", "1 Brass = 100 CFT", "Architectural finishing, tile bedding, putty prep"],
      ["20mm Granite Jelly", "10 – 20 mm", "Dust-free", "1 Ton ≈ 23 CFT", "Standard M20/M25 concrete structural pours"]
    ]
  }
};

/* ==========================================================================
   ADMIN PANEL LOCAL OVERRIDE HYDRATION (Keeps storefront synced with Admin)
   ========================================================================== */
(function () {
  window.BUILDKART_DEFAULTS = {
    storeConfig: JSON.parse(JSON.stringify(STORE_CONFIG)),
    products: JSON.parse(JSON.stringify(PRODUCTS))
  };

  try {
    var savedConfig = localStorage.getItem("buildkart_admin_config_v1");
    if (savedConfig) {
      var parsedConfig = JSON.parse(savedConfig);
      if (parsedConfig && typeof parsedConfig === "object") {
        Object.keys(parsedConfig).forEach(function (k) {
          STORE_CONFIG[k] = parsedConfig[k];
        });
      }
    }

    var savedProducts = localStorage.getItem("buildkart_admin_products_v1");
    if (savedProducts) {
      var parsedProducts = JSON.parse(savedProducts);
      if (Array.isArray(parsedProducts)) {
        PRODUCTS = parsedProducts;
      }
    }
  } catch (err) {
    // Fallback gracefully to file defaults if localStorage is unavailable
  }
})();

