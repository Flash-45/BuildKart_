/* ==========================================================================
   BuildKart — Storefront Functionality & Shopping Cart Engine
   ==========================================================================
   Pure vanilla JavaScript (classic script mode, works offline via file://
   and online on any static host like GitHub Pages, Netlify, or Vercel).
   ========================================================================== */

(function () {
  "use strict";

  var CART_STORAGE_KEY = "buildkart_cart_v1";

  /* ------------------------------------------------------------------------
     1. Utility Helpers (Currency Formatting, Escaping, WhatsApp URLs)
     ------------------------------------------------------------------------ */
  function formatINR(amount) {
    var num = Number(amount) || 0;
    return "₹" + num.toLocaleString("en-IN");
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildWhatsAppLink(messageText) {
    var phone = (typeof STORE_CONFIG !== "undefined" && STORE_CONFIG.whatsappNumber)
      ? STORE_CONFIG.whatsappNumber
      : "919876543210";
    return "https://wa.me/" + encodeURIComponent(phone) + "?text=" + encodeURIComponent(messageText);
  }

  function findProductById(id) {
    if (typeof PRODUCTS === "undefined") return null;
    var numId = Number(id);
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === numId) {
        return PRODUCTS[i];
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------------
     2. Cart Engine (Saved in localStorage so cart persists across refreshes)
     ------------------------------------------------------------------------ */
  function getCart() {
    try {
      var raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCart(cartItems) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      // Ignore storage quota errors in restricted browsing modes
    }
    updateHeaderCartCount();
  }

  function getCartCount() {
    var cart = getCart();
    var totalItems = 0;
    for (var i = 0; i < cart.length; i++) {
      totalItems += Number(cart[i].quantity) || 0;
    }
    return totalItems;
  }

  function addToCart(productId, quantityToAdd) {
    var product = findProductById(productId);
    if (!product) return;

    var qty = parseInt(quantityToAdd, 10);
    if (isNaN(qty) || qty < 1) {
      qty = product.minOrder || 1;
    }

    var cart = getCart();
    var found = false;

    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === product.id) {
        cart[i].quantity = (Number(cart[i].quantity) || 0) + qty;
        found = true;
        break;
      }
    }

    if (!found) {
      cart.push({ productId: product.id, quantity: qty });
    }

    saveCart(cart);
    showToast(product.name + " added (" + qty + ")", "cart.html", "View Cart");
  }

  function updateCartQuantity(productId, newQuantity) {
    var qty = parseInt(newQuantity, 10);
    var cart = getCart();
    var updated = [];

    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === Number(productId)) {
        if (!isNaN(qty) && qty > 0) {
          updated.push({ productId: cart[i].productId, quantity: qty });
        }
      } else {
        updated.push(cart[i]);
      }
    }

    saveCart(updated);
  }

  function removeFromCart(productId) {
    var cart = getCart();
    var updated = [];
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId !== Number(productId)) {
        updated.push(cart[i]);
      }
    }
    saveCart(updated);
  }

  function clearCart() {
    saveCart([]);
  }

  function calculateCartTotals() {
    var cart = getCart();
    var detailedItems = [];
    var subtotal = 0;

    for (var i = 0; i < cart.length; i++) {
      var product = findProductById(cart[i].productId);
      if (product) {
        var qty = Math.max(1, parseInt(cart[i].quantity, 10) || 1);
        var lineTotal = product.price * qty;
        subtotal += lineTotal;
        detailedItems.push({
          product: product,
          quantity: qty,
          lineTotal: lineTotal
        });
      }
    }

    return {
      items: detailedItems,
      subtotal: subtotal,
      // Delivery is confirmed by site distance; free dispatch over ₹25,000
      deliveryFee: subtotal === 0 ? 0 : (subtotal >= 25000 ? 0 : 650),
      total: subtotal === 0 ? 0 : subtotal + (subtotal >= 25000 ? 0 : 650)
    };
  }

  function updateHeaderCartCount() {
    var count = getCartCount();
    var badges = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = String(count);
    }
  }

  /* ------------------------------------------------------------------------
     3. Toast Notification & Mobile Drawer Navigation
     ------------------------------------------------------------------------ */
  var toastTimer = null;

  function showToast(message, linkHref, linkText) {
    var toast = document.getElementById("bk-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "bk-toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.innerHTML =
      '<span>' + escapeHTML(message) + "</span>" +
      (linkHref ? '<a class="toast-link" href="' + escapeHTML(linkHref) + '">' + escapeHTML(linkText || "Open") + "</a>" : "");

    toast.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("visible");
    }, 3200);
  }

  function initMobileMenu() {
    var toggleBtn = document.getElementById("menu-toggle-btn");
    var closeBtn = document.getElementById("drawer-close-btn");
    var drawer = document.getElementById("mobile-drawer");
    var backdrop = document.getElementById("mobile-drawer-backdrop");

    if (!toggleBtn || !drawer || !backdrop) return;

    function openDrawer() {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    toggleBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });
  }

  function initGlobalSearch() {
    var form = document.querySelector(".header-search-form");
    var input = document.getElementById("global-header-search");
    var clearBtn = document.getElementById("global-search-clear");
    var dropdown = document.getElementById("global-search-dropdown");
    if (!form || !input) return;

    var isShopPage = Boolean(document.getElementById("shop-products-grid"));
    var params = new URLSearchParams(window.location.search);
    var urlQuery = params.get("q") || "";
    if (urlQuery) {
      input.value = urlQuery;
    }

    function syncClearBtn() {
      if (clearBtn) {
        clearBtn.hidden = input.value.trim().length === 0;
      }
    }

    function closeDropdown() {
      if (dropdown) {
        dropdown.hidden = true;
      }
    }

    function renderDropdown(rawTerm) {
      if (!dropdown || isShopPage || typeof PRODUCTS === "undefined") {
        closeDropdown();
        return;
      }

      var term = rawTerm.trim().toLowerCase();
      if (!term) {
        closeDropdown();
        return;
      }

      var categories = ["Cement", "Steel", "Bricks", "Sand"];
      var matchedCategories = [];
      for (var c = 0; c < categories.length; c++) {
        if (categories[c].toLowerCase().indexOf(term) !== -1) {
          matchedCategories.push(categories[c]);
        }
      }

      var matchedProducts = [];
      for (var i = 0; i < PRODUCTS.length; i++) {
        var p = PRODUCTS[i];
        if (
          p.name.toLowerCase().indexOf(term) !== -1 ||
          p.brand.toLowerCase().indexOf(term) !== -1 ||
          p.category.toLowerCase().indexOf(term) !== -1 ||
          p.gradeSpec.toLowerCase().indexOf(term) !== -1 ||
          p.unit.toLowerCase().indexOf(term) !== -1
        ) {
          matchedProducts.push(p);
        }
      }

      var html = "";

      if (matchedCategories.length > 0) {
        html += '<div class="search-drop-group-label">Categories</div>';
        for (var mc = 0; mc < matchedCategories.length; mc++) {
          var catName = matchedCategories[mc];
          html +=
            '<a class="search-drop-item" href="shop.html?category=' + encodeURIComponent(catName) + '">' +
            '  <div class="search-drop-left">' +
            '    <div>' +
            '      <div class="search-drop-title">' + escapeHTML(catName) + "</div>" +
            '      <div class="search-drop-meta">Browse category in Shop</div>' +
            "    </div>" +
            "  </div>" +
            '  <span class="search-drop-price">View &rarr;</span>' +
            "</a>";
        }
      }

      if (matchedProducts.length > 0) {
        html += '<div class="search-drop-group-label">Materials (' + matchedProducts.length + ")</div>";
        var limit = Math.min(5, matchedProducts.length);
        for (var mp = 0; mp < limit; mp++) {
          var prod = matchedProducts[mp];
          html +=
            '<a class="search-drop-item" href="product.html?id=' + encodeURIComponent(prod.id) + '">' +
            '  <div class="search-drop-left">' +
            '    <img src="' + escapeHTML(prod.image) + '" alt="' + escapeHTML(prod.name) + '" class="search-drop-thumb" referrerpolicy="no-referrer" />' +
            '    <div style="min-width:0;">' +
            '      <div class="search-drop-title">' + escapeHTML(prod.name) + "</div>" +
            '      <div class="search-drop-meta">' + escapeHTML(prod.brand) + " · " + escapeHTML(prod.category) + "</div>" +
            "    </div>" +
            "  </div>" +
            '  <span class="search-drop-price">' + formatINR(prod.price) + "</span>" +
            "</a>";
        }
        html +=
          '<a class="search-drop-footer" href="shop.html?q=' + encodeURIComponent(rawTerm.trim()) + '">' +
          "  View all " + matchedProducts.length + " matching material" + (matchedProducts.length === 1 ? "" : "s") + " in Shop &rarr;" +
          "</a>";
      } else if (matchedCategories.length === 0) {
        html +=
          '<div style="padding: 16px 14px; text-align: center; font-size: 13px; color: var(--text-muted);">No matching materials found for "' + escapeHTML(rawTerm.trim()) + '".</div>' +
          '<a class="search-drop-footer" href="shop.html">Browse All Materials &rarr;</a>';
      }

      dropdown.innerHTML = html;
      dropdown.hidden = false;
    }

    syncClearBtn();

    input.addEventListener("input", function () {
      syncClearBtn();
      if (isShopPage) {
        var shopSearch = document.getElementById("shop-search-input");
        if (shopSearch) {
          shopSearch.value = input.value;
          shopSearch.dispatchEvent(new Event("input", { bubbles: true }));
        }
        closeDropdown();
      } else {
        renderDropdown(input.value);
      }
    });

    input.addEventListener("focus", function () {
      if (!isShopPage && input.value.trim()) {
        renderDropdown(input.value);
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        syncClearBtn();
        closeDropdown();
        if (isShopPage) {
          var shopSearch = document.getElementById("shop-search-input");
          if (shopSearch) {
            shopSearch.value = "";
            shopSearch.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        input.focus();
      });
    }

    form.addEventListener("submit", function (event) {
      var trimmed = input.value.trim();
      if (isShopPage) {
        event.preventDefault();
        var shopSearch = document.getElementById("shop-search-input");
        if (shopSearch) {
          shopSearch.value = input.value;
          shopSearch.dispatchEvent(new Event("input", { bubbles: true }));
        }
        closeDropdown();
        input.blur();
        var grid = document.getElementById("shop-products-grid");
        if (grid && grid.scrollIntoView) {
          grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } else if (!trimmed) {
        event.preventDefault();
        window.location.href = "shop.html";
      }
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    });
  }

  function initFloatingWhatsApp() {
    var floatLinks = document.querySelectorAll("[data-whatsapp-float]");
    var defaultUrl = buildWhatsAppLink("Hi " + (STORE_CONFIG.storeName || "BuildKart") + " team, I want to enquire about construction materials.");
    for (var i = 0; i < floatLinks.length; i++) {
      floatLinks[i].setAttribute("href", defaultUrl);
    }

    var yearEls = document.querySelectorAll("[data-current-year]");
    var yearStr = String(new Date().getFullYear());
    for (var j = 0; j < yearEls.length; j++) {
      yearEls[j].textContent = yearStr;
    }

    // Hydrate editable Store Settings across Contact page & Footer
    if (typeof STORE_CONFIG !== "undefined") {
      var phoneEls = document.querySelectorAll("[data-store-phone]");
      for (var p = 0; p < phoneEls.length; p++) {
        phoneEls[p].textContent = STORE_CONFIG.supportPhoneDisplay || "";
      }
      var emailEls = document.querySelectorAll("[data-store-email]");
      for (var e = 0; e < emailEls.length; e++) {
        emailEls[e].textContent = STORE_CONFIG.supportEmail || "";
      }
      var hoursEls = document.querySelectorAll("[data-store-hours]");
      for (var h = 0; h < hoursEls.length; h++) {
        hoursEls[h].textContent = STORE_CONFIG.dispatchHours || "";
      }
    }
  }

  /* ------------------------------------------------------------------------
     4. Reusable Product Card Renderer
     ------------------------------------------------------------------------ */
  function createProductCardHTML(product) {
    var detailUrl = "product.html?id=" + encodeURIComponent(product.id);
    var defaultQty = product.minOrder || 1;
    var isAvailable = product.inStock !== false;
    var stockMeta = isAvailable
      ? ""
      : '      <span aria-hidden="true">·</span><span style="color: var(--danger);">Out of Stock</span>';
    var addBtnHtml = isAvailable
      ? '      <button type="button" class="btn btn-primary" data-add-cart="' + product.id + '" data-default-qty="' + defaultQty + '">Add ' + defaultQty + ' to Cart</button>'
      : '      <button type="button" class="btn btn-outline" disabled style="opacity: 0.6; cursor: not-allowed;">Out of Stock</button>';

    return (
      '<article class="product-card">' +
      '  <a class="product-image-wrap" href="' + detailUrl + '">' +
      '    <img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.alt) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<div class=image-fallback>' + escapeHTML(product.brand + " " + product.category) + '</div>\'">' +
      "  </a>" +
      '  <div class="product-card-body">' +
      '    <div class="product-meta-line">' +
      "      <span>" + escapeHTML(product.brand) + "</span>" +
      '      <span aria-hidden="true">·</span>' +
      "      <span>" + escapeHTML(product.category) + "</span>" +
      stockMeta +
      "    </div>" +
      '    <h3 class="product-title"><a href="' + detailUrl + '">' + escapeHTML(product.name) + "</a></h3>" +
      '    <p class="product-grade">' + escapeHTML(product.gradeSpec) + "</p>" +
      '    <div class="product-price-row">' +
      '      <span class="product-price">' + formatINR(product.price) + "</span>" +
      '      <span class="product-unit">/ ' + escapeHTML(product.unit) + "</span>" +
      "    </div>" +
      '    <div class="product-card-actions">' +
      addBtnHtml +
      '      <a class="btn btn-outline" href="' + detailUrl + '">Specs</a>' +
      "    </div>" +
      "  </div>" +
      "</article>"
    );
  }

  // Delegate clicks for "Add to Cart" buttons anywhere in grids
  function bindGlobalAddToCart() {
    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-add-cart]");
      if (!btn) return;
      var productId = btn.getAttribute("data-add-cart");
      var qty = btn.getAttribute("data-default-qty") || 1;
      addToCart(productId, qty);
    });
  }

  /* ------------------------------------------------------------------------
     5. Material Grade & Size Guide Renderer (Home & Shop Pages)
     ------------------------------------------------------------------------ */
  function initGradeGuide() {
    var tabsContainer = document.getElementById("grade-guide-tabs");
    var panelContainer = document.getElementById("grade-guide-panel");
    if (!tabsContainer || !panelContainer || typeof GRADE_GUIDE === "undefined") return;

    function renderGuideTab(key) {
      var data = GRADE_GUIDE[key] || GRADE_GUIDE.steel;

      var buttons = tabsContainer.querySelectorAll("[data-guide-key]");
      for (var i = 0; i < buttons.length; i++) {
        var isActive = buttons[i].getAttribute("data-guide-key") === key;
        buttons[i].classList.toggle("active", isActive);
        buttons[i].setAttribute("aria-selected", isActive ? "true" : "false");
      }

      var headerCells = "";
      for (var h = 0; h < data.headers.length; h++) {
        headerCells += "<th>" + escapeHTML(data.headers[h]) + "</th>";
      }

      var bodyRows = "";
      for (var r = 0; r < data.rows.length; r++) {
        bodyRows += "<tr>";
        for (var c = 0; c < data.rows[r].length; c++) {
          var cellClass = c <= 2 ? ' class="mono-cell"' : "";
          bodyRows += "<td" + cellClass + ">" + escapeHTML(data.rows[r][c]) + "</td>";
        }
        bodyRows += "</tr>";
      }

      panelContainer.innerHTML =
        '<div class="guide-panel-head">' +
        '  <h3 class="guide-panel-title">' + escapeHTML(data.title) + "</h3>" +
        '  <p class="guide-panel-summary">' + escapeHTML(data.summary) + "</p>" +
        "</div>" +
        '<div class="table-scroll">' +
        '  <table class="spec-table">' +
        "    <thead><tr>" + headerCells + "</tr></thead>" +
        "    <tbody>" + bodyRows + "</tbody>" +
        "  </table>" +
        "</div>";
    }

    tabsContainer.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-guide-key]");
      if (!btn) return;
      renderGuideTab(btn.getAttribute("data-guide-key"));
    });

    renderGuideTab("steel");
  }

  /* ------------------------------------------------------------------------
     6. Home Page Initializer
     ------------------------------------------------------------------------ */
  function initHomePage() {
    var featuredGrid = document.getElementById("featured-products-grid");
    if (!featuredGrid || typeof PRODUCTS === "undefined") return;

    var featured = [];
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].featured) {
        featured.push(PRODUCTS[i]);
      }
    }

    var html = "";
    for (var j = 0; j < featured.length; j++) {
      html += createProductCardHTML(featured[j]);
    }
    featuredGrid.innerHTML = html;
  }

  /* ------------------------------------------------------------------------
     7. Shop Page Initializer (Category, Budget Slider/Brackets, Multi-Brand)
     ------------------------------------------------------------------------ */
  function initShopPage() {
    var catalogGrid = document.getElementById("shop-products-grid");
    if (!catalogGrid || typeof PRODUCTS === "undefined") return;

    var tabsWrap = document.getElementById("category-filter-tabs");
    var searchInput = document.getElementById("shop-search-input");
    var globalSearchInput = document.getElementById("global-header-search");
    var globalSearchClear = document.getElementById("global-search-clear");
    var sortSelect = document.getElementById("shop-sort-select");
    var resultsCount = document.getElementById("shop-results-count");

    // Sidebar & Budget/Brand controls
    var sidebar = document.getElementById("shop-filter-sidebar");
    var mobileFilterToggle = document.getElementById("mobile-filter-toggle");
    var sidebarClearBtn = document.getElementById("sidebar-clear-btn");
    var bracketGroup = document.getElementById("price-bracket-group");
    var rangeSlider = document.getElementById("price-range-slider");
    var rangeValueEl = document.getElementById("price-range-value");
    var brandListEl = document.getElementById("brand-checkbox-list");

    // Adjust slider maximum dynamically if admin adds higher-priced materials
    var highestPrice = 75000;
    for (var pIdx = 0; pIdx < PRODUCTS.length; pIdx++) {
      if (PRODUCTS[pIdx].price > highestPrice) {
        highestPrice = Math.ceil(PRODUCTS[pIdx].price / 1000) * 1000;
      }
    }
    if (rangeSlider) {
      rangeSlider.max = String(highestPrice);
      rangeSlider.value = String(highestPrice);
    }

    // Read optional ?category= and ?q= from URL (e.g. shop.html?category=Steel or shop.html?q=ultratech)
    var params = new URLSearchParams(window.location.search);
    var activeCategory = params.get("category") || "All";
    var initialQuery = params.get("q") || "";
    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }
    if (globalSearchInput && initialQuery) {
      globalSearchInput.value = initialQuery;
      if (globalSearchClear) globalSearchClear.hidden = false;
    }
    var activeBracket = "all";
    var maxSliderPrice = rangeSlider ? Number(rangeSlider.max) : highestPrice;
    var selectedBrands = {};

    // Count products per brand and render multi-select checkboxes
    if (brandListEl) {
      var brandCounts = {};
      var brandNames = [];
      for (var i = 0; i < PRODUCTS.length; i++) {
        var bName = PRODUCTS[i].brand;
        if (!brandCounts[bName]) {
          brandCounts[bName] = 0;
          brandNames.push(bName);
        }
        brandCounts[bName] += 1;
      }

      var brandHtml = "";
      for (var bIdx = 0; bIdx < brandNames.length; bIdx++) {
        var brand = brandNames[bIdx];
        brandHtml +=
          '<label class="checkbox-row">' +
          '  <span class="checkbox-left">' +
          '    <input type="checkbox" class="brand-checkbox" value="' + escapeHTML(brand) + '" />' +
          '    <span>' + escapeHTML(brand) + "</span>" +
          "  </span>" +
          '  <span class="checkbox-count tabular-nums">' + brandCounts[brand] + "</span>" +
          "</label>";
      }
      brandListEl.innerHTML = brandHtml;
    }

    // Mobile Filter Panel Toggle
    if (mobileFilterToggle && sidebar) {
      mobileFilterToggle.addEventListener("click", function () {
        var isOpen = sidebar.classList.toggle("open");
        mobileFilterToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    function setActiveTabUI() {
      if (!tabsWrap) return;
      var tabBtns = tabsWrap.querySelectorAll("[data-category]");
      for (var i = 0; i < tabBtns.length; i++) {
        var cat = tabBtns[i].getAttribute("data-category");
        tabBtns[i].classList.toggle("active", cat === activeCategory);
      }
    }

    function setActiveBracketUI() {
      if (!bracketGroup) return;
      var btns = bracketGroup.querySelectorAll("[data-bracket]");
      for (var i = 0; i < btns.length; i++) {
        var br = btns[i].getAttribute("data-bracket");
        btns[i].classList.toggle("active", br === activeBracket);
      }
    }

    function syncRangeReadout() {
      if (!rangeSlider || !rangeValueEl) return;
      var val = Number(rangeSlider.value);
      var maxVal = Number(rangeSlider.max);
      rangeValueEl.textContent = val >= maxVal ? formatINR(maxVal) + "+" : formatINR(val);
    }

    function matchesBudget(price) {
      // Check max slider limit first (when below max slider cap)
      if (rangeSlider && maxSliderPrice < Number(rangeSlider.max) && price > maxSliderPrice) {
        return false;
      }
      if (activeBracket === "under-1000") return price < 1000;
      if (activeBracket === "1000-10000") return price >= 1000 && price <= 10000;
      if (activeBracket === "10000-plus") return price > 10000;
      return true;
    }

    function resetAllFilters() {
      activeCategory = "All";
      activeBracket = "all";
      selectedBrands = {};
      if (searchInput) searchInput.value = "";
      if (globalSearchInput) globalSearchInput.value = "";
      if (globalSearchClear) globalSearchClear.hidden = true;
      if (sortSelect) sortSelect.value = "default";
      if (rangeSlider) {
        maxSliderPrice = Number(rangeSlider.max);
        rangeSlider.value = String(maxSliderPrice);
        syncRangeReadout();
      }
      if (brandListEl) {
        var boxes = brandListEl.querySelectorAll(".brand-checkbox");
        for (var i = 0; i < boxes.length; i++) {
          boxes[i].checked = false;
        }
      }
      setActiveTabUI();
      setActiveBracketUI();
      renderCatalog();
    }

    function renderCatalog() {
      var searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var sortMode = sortSelect ? sortSelect.value : "default";
      var activeBrandKeys = Object.keys(selectedBrands);
      var hasBrandFilter = activeBrandKeys.length > 0;

      var filtered = [];
      for (var i = 0; i < PRODUCTS.length; i++) {
        var p = PRODUCTS[i];
        var matchesCat = activeCategory === "All" || p.category === activeCategory;
        var matchesBrand = !hasBrandFilter || Boolean(selectedBrands[p.brand]);
        var matchesPrice = matchesBudget(p.price);
        var matchesQuery =
          !searchTerm ||
          p.name.toLowerCase().indexOf(searchTerm) !== -1 ||
          p.brand.toLowerCase().indexOf(searchTerm) !== -1 ||
          p.gradeSpec.toLowerCase().indexOf(searchTerm) !== -1 ||
          p.category.toLowerCase().indexOf(searchTerm) !== -1 ||
          p.unit.toLowerCase().indexOf(searchTerm) !== -1;

        if (matchesCat && matchesBrand && matchesPrice && matchesQuery) {
          filtered.push(p);
        }
      }

      if (sortMode === "price-asc") {
        filtered.sort(function (a, b) { return a.price - b.price; });
      } else if (sortMode === "price-desc") {
        filtered.sort(function (a, b) { return b.price - a.price; });
      }

      if (resultsCount) {
        resultsCount.textContent =
          "Showing " + filtered.length + " of " + PRODUCTS.length + " materials";
      }

      if (filtered.length === 0) {
        catalogGrid.innerHTML =
          '<div class="empty-state" style="grid-column: 1 / -1;">' +
          "  <h3>No matching materials found</h3>" +
          "  <p>Try expanding your budget range, unchecking a brand, or clearing search.</p>" +
          '  <button type="button" id="reset-filters-btn" class="btn btn-primary">Reset All Filters</button>' +
          "</div>";

        var resetBtn = document.getElementById("reset-filters-btn");
        if (resetBtn) {
          resetBtn.addEventListener("click", resetAllFilters);
        }
        return;
      }

      var html = "";
      for (var j = 0; j < filtered.length; j++) {
        html += createProductCardHTML(filtered[j]);
      }
      catalogGrid.innerHTML = html;
    }

    if (tabsWrap) {
      tabsWrap.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-category]");
        if (!btn) return;
        activeCategory = btn.getAttribute("data-category");
        setActiveTabUI();
        renderCatalog();
      });
    }

    if (bracketGroup) {
      bracketGroup.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-bracket]");
        if (!btn) return;
        activeBracket = btn.getAttribute("data-bracket");
        // Reset slider cap back to max when picking a bracket preset so presets don't conflict
        if (rangeSlider) {
          maxSliderPrice = Number(rangeSlider.max);
          rangeSlider.value = String(maxSliderPrice);
          syncRangeReadout();
        }
        setActiveBracketUI();
        renderCatalog();
      });
    }

    if (rangeSlider) {
      syncRangeReadout();
      rangeSlider.addEventListener("input", function () {
        maxSliderPrice = Number(rangeSlider.value);
        // When dragging custom slider below max, reset bracket preset to All Budgets
        if (maxSliderPrice < Number(rangeSlider.max) && activeBracket !== "all") {
          activeBracket = "all";
          setActiveBracketUI();
        }
        syncRangeReadout();
        renderCatalog();
      });
    }

    if (brandListEl) {
      brandListEl.addEventListener("change", function (event) {
        var checkbox = event.target.closest(".brand-checkbox");
        if (!checkbox) return;
        if (checkbox.checked) {
          selectedBrands[checkbox.value] = true;
        } else {
          delete selectedBrands[checkbox.value];
        }
        renderCatalog();
      });
    }

    if (sidebarClearBtn) {
      sidebarClearBtn.addEventListener("click", resetAllFilters);
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        if (globalSearchInput && globalSearchInput.value !== searchInput.value) {
          globalSearchInput.value = searchInput.value;
          if (globalSearchClear) globalSearchClear.hidden = searchInput.value.trim().length === 0;
        }
        renderCatalog();
      });
    }
    if (sortSelect) sortSelect.addEventListener("change", renderCatalog);

    setActiveTabUI();
    setActiveBracketUI();
    renderCatalog();
  }

  /* ------------------------------------------------------------------------
     8. Product Detail Page Initializer (Reads ?id= from URL)
     ------------------------------------------------------------------------ */
  function initProductPage() {
    var pdpContainer = document.getElementById("pdp-container");
    if (!pdpContainer || typeof PRODUCTS === "undefined") return;

    var params = new URLSearchParams(window.location.search);
    var productId = params.get("id") || "1";
    var product = findProductById(productId) || PRODUCTS[0];

    // Update page title & breadcrumb dynamically
    document.title = product.name + " | BuildKart";
    var breadcrumbCurrent = document.getElementById("pdp-breadcrumb-name");
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

    var specRows = "";
    var specKeys = Object.keys(product.specs || {});
    for (var i = 0; i < specKeys.length; i++) {
      var key = specKeys[i];
      specRows +=
        "<tr>" +
        "  <th>" + escapeHTML(key) + "</th>" +
        "  <td>" + escapeHTML(product.specs[key]) + "</td>" +
        "</tr>";
    }

    var initialQty = product.minOrder || 1;
    var isAvailable = product.inStock !== false;
    var stockHtml = isAvailable
      ? '<span class="pdp-stock">· Ready for Site Dispatch</span>'
      : '<span class="pdp-stock" style="color: var(--danger);">· Currently Out of Stock</span>';
    var addBtnHtml = isAvailable
      ? '<button type="button" id="pdp-add-btn" class="btn btn-primary">Add to Cart</button>'
      : '<button type="button" id="pdp-add-btn" class="btn btn-outline" disabled style="opacity: 0.6; cursor: not-allowed;">Out of Stock</button>';

    pdpContainer.innerHTML =
      '<div class="pdp-layout">' +
      '  <div class="pdp-gallery">' +
      '    <img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.alt) + '" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<div class=image-fallback>' + escapeHTML(product.name) + '</div>\'">' +
      "  </div>" +
      '  <div class="pdp-info">' +
      '    <div class="product-meta-line">' +
      "      <span>" + escapeHTML(product.brand) + "</span>" +
      '      <span aria-hidden="true">·</span>' +
      "      <span>" + escapeHTML(product.category) + "</span>" +
      '      <span aria-hidden="true">·</span>' +
      "      <span>" + escapeHTML(product.gradeSpec) + "</span>" +
      "    </div>" +
      '    <h1 class="pdp-title">' + escapeHTML(product.name) + "</h1>" +
      '    <div class="pdp-price-box">' +
      '      <span class="pdp-price">' + formatINR(product.price) + "</span>" +
      '      <span class="pdp-unit">/ ' + escapeHTML(product.unit) + "</span>" +
      "      " + stockHtml +
      "    </div>" +
      '    <p class="pdp-desc">' + escapeHTML(product.description) + "</p>" +
      '    <div class="qty-control-row">' +
      '      <label class="form-label" for="pdp-qty-input">Order Quantity (' + escapeHTML(product.unit) + "):</label>" +
      '      <div class="qty-stepper">' +
      '        <button type="button" class="qty-btn" id="pdp-qty-minus" aria-label="Decrease quantity">-</button>' +
      '        <input type="number" id="pdp-qty-input" class="qty-input" value="' + initialQty + '" min="1" step="1" aria-label="Quantity">' +
      '        <button type="button" class="qty-btn" id="pdp-qty-plus" aria-label="Increase quantity">+</button>' +
      "      </div>" +
      "    </div>" +
      '    <div class="pdp-actions">' +
      "      " + addBtnHtml +
      '      <a id="pdp-whatsapp-btn" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer" href="#">Order Directly on WhatsApp</a>' +
      "    </div>" +
      '    <div class="pdp-specs">' +
      '      <h2 class="pdp-specs-title">Technical Specifications</h2>' +
      '      <table class="pdp-specs-table"><tbody>' + specRows + "</tbody></table>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    var qtyInput = document.getElementById("pdp-qty-input");
    var minusBtn = document.getElementById("pdp-qty-minus");
    var plusBtn = document.getElementById("pdp-qty-plus");
    var addBtn = document.getElementById("pdp-add-btn");
    var waBtn = document.getElementById("pdp-whatsapp-btn");

    function getSelectedQty() {
      var val = parseInt(qtyInput.value, 10);
      return isNaN(val) || val < 1 ? 1 : val;
    }

    function syncWhatsAppLink() {
      var qty = getSelectedQty();
      var estTotal = formatINR(product.price * qty);
      var msg =
        "Hi BuildKart, I want to order:\n" +
        "• Product: " + product.name + " (" + product.brand + ")\n" +
        "• Quantity: " + qty + " x " + product.unit + "\n" +
        "• Estimated Amount: " + estTotal + "\n" +
        "Please confirm site delivery timeline.";
      waBtn.setAttribute("href", buildWhatsAppLink(msg));
    }

    minusBtn.addEventListener("click", function () {
      var current = getSelectedQty();
      if (current > 1) {
        qtyInput.value = String(current - 1);
        syncWhatsAppLink();
      }
    });

    plusBtn.addEventListener("click", function () {
      qtyInput.value = String(getSelectedQty() + 1);
      syncWhatsAppLink();
    });

    qtyInput.addEventListener("input", syncWhatsAppLink);

    addBtn.addEventListener("click", function () {
      addToCart(product.id, getSelectedQty());
    });

    syncWhatsAppLink();

    // Render related materials from same category
    var relatedGrid = document.getElementById("related-products-grid");
    if (relatedGrid) {
      var related = [];
      for (var j = 0; j < PRODUCTS.length; j++) {
        if (PRODUCTS[j].category === product.category && PRODUCTS[j].id !== product.id) {
          related.push(PRODUCTS[j]);
        }
      }
      var relHtml = "";
      for (var k = 0; k < Math.min(3, related.length); k++) {
        relHtml += createProductCardHTML(related[k]);
      }
      relatedGrid.innerHTML = relHtml;
    }
  }

  /* ------------------------------------------------------------------------
     9. Cart & Checkout Page Initializer (Quantity, Totals, UPI, WhatsApp)
     ------------------------------------------------------------------------ */
  function initCartPage() {
    var cartContainer = document.getElementById("cart-items-container");
    if (!cartContainer) return;

    var subtotalEl = document.getElementById("summary-subtotal");
    var deliveryEl = document.getElementById("summary-delivery");
    var totalEl = document.getElementById("summary-total");
    var checkoutForm = document.getElementById("checkout-form");
    var upiSection = document.getElementById("upi-payment-box");
    var upiIdDisplay = document.getElementById("upi-id-text");
    var upiQrImg = document.getElementById("upi-qr-img");
    var copyUpiBtn = document.getElementById("copy-upi-btn");
    var confirmationBox = document.getElementById("order-confirmation-box");

    if (typeof STORE_CONFIG !== "undefined") {
      if (upiIdDisplay) upiIdDisplay.textContent = STORE_CONFIG.upiId;
      if (upiQrImg) upiQrImg.src = STORE_CONFIG.upiQrImage;
    }

    function renderCart() {
      var totals = calculateCartTotals();

      if (subtotalEl) subtotalEl.textContent = formatINR(totals.subtotal);
      if (deliveryEl) {
        deliveryEl.textContent =
          totals.subtotal === 0
            ? "₹0"
            : totals.deliveryFee === 0
              ? "FREE (Order >= ₹25,000)"
              : formatINR(totals.deliveryFee);
      }
      if (totalEl) totalEl.textContent = formatINR(totals.total);

      if (totals.items.length === 0) {
        cartContainer.innerHTML =
          '<div class="empty-state">' +
          "  <h3>Your BuildKart order cart is empty</h3>" +
          "  <p>Browse Cement, TMT Steel, Bricks, and Sand to add materials for your construction site.</p>" +
          '  <a href="shop.html" class="btn btn-primary">Browse All Materials</a>' +
          "</div>";
        return;
      }

      var html = "";
      for (var i = 0; i < totals.items.length; i++) {
        var entry = totals.items[i];
        var p = entry.product;
        html +=
          '<article class="cart-item">' +
          '  <a class="cart-item-img" href="product.html?id=' + p.id + '">' +
          '    <img src="' + escapeHTML(p.image) + '" alt="' + escapeHTML(p.alt) + '" referrerpolicy="no-referrer">' +
          "  </a>" +
          '  <div class="cart-item-body">' +
          '    <h3 class="cart-item-title"><a href="product.html?id=' + p.id + '">' + escapeHTML(p.name) + "</a></h3>" +
          '    <div class="cart-item-meta">' + escapeHTML(p.brand) + " · " + formatINR(p.price) + " / " + escapeHTML(p.unit) + "</div>" +
          '    <div class="cart-item-controls">' +
          '      <div class="qty-stepper">' +
          '        <button type="button" class="qty-btn" data-cart-dec="' + p.id + '" aria-label="Decrease quantity">-</button>' +
          '        <input type="number" class="qty-input" data-cart-input="' + p.id + '" value="' + entry.quantity + '" min="1" aria-label="Item quantity">' +
          '        <button type="button" class="qty-btn" data-cart-inc="' + p.id + '" aria-label="Increase quantity">+</button>' +
          "      </div>" +
          '      <span class="cart-item-subtotal">' + formatINR(entry.lineTotal) + "</span>" +
          '      <button type="button" class="remove-btn" data-cart-remove="' + p.id + '">Remove</button>' +
          "    </div>" +
          "  </div>" +
          "</article>";
      }

      cartContainer.innerHTML = html;
    }

    // Event delegation for cart item steppers & removal
    cartContainer.addEventListener("click", function (event) {
      var decBtn = event.target.closest("[data-cart-dec]");
      var incBtn = event.target.closest("[data-cart-inc]");
      var remBtn = event.target.closest("[data-cart-remove]");

      if (decBtn) {
        var decId = Number(decBtn.getAttribute("data-cart-dec"));
        var cart = getCart();
        for (var i = 0; i < cart.length; i++) {
          if (cart[i].productId === decId) {
            updateCartQuantity(decId, cart[i].quantity - 1);
            break;
          }
        }
        renderCart();
      } else if (incBtn) {
        var incId = Number(incBtn.getAttribute("data-cart-inc"));
        var cart2 = getCart();
        for (var j = 0; j < cart2.length; j++) {
          if (cart2[j].productId === incId) {
            updateCartQuantity(incId, cart2[j].quantity + 1);
            break;
          }
        }
        renderCart();
      } else if (remBtn) {
        var remId = Number(remBtn.getAttribute("data-cart-remove"));
        removeFromCart(remId);
        renderCart();
      }
    });

    cartContainer.addEventListener("change", function (event) {
      var input = event.target.closest("[data-cart-input]");
      if (!input) return;
      var id = Number(input.getAttribute("data-cart-input"));
      updateCartQuantity(id, input.value);
      renderCart();
    });

    // Show or highlight UPI box based on selected payment method
    var paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    for (var r = 0; r < paymentRadios.length; r++) {
      paymentRadios[r].addEventListener("change", function () {
        if (!upiSection) return;
        upiSection.style.display = this.value === "UPI / Payment Link" ? "flex" : "none";
      });
    }

    if (copyUpiBtn && upiIdDisplay) {
      copyUpiBtn.addEventListener("click", function () {
        var text = upiIdDisplay.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast("UPI ID copied: " + text);
          });
        } else {
          showToast("UPI ID: " + text);
        }
      });
    }

    if (checkoutForm) {
      checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var totals = calculateCartTotals();

        var errEl = document.getElementById("checkout-form-error");
        if (totals.items.length === 0) {
          if (errEl) errEl.textContent = "Please add at least one material to your cart before placing an order.";
          return;
        }

        var nameVal = document.getElementById("cust-name").value.trim();
        var phoneVal = document.getElementById("cust-phone").value.trim();
        var addressVal = document.getElementById("cust-address").value.trim();
        var selectedPay = document.querySelector('input[name="paymentMethod"]:checked');
        var paymentMethod = selectedPay ? selectedPay.value : "UPI / Payment Link";

        if (!nameVal || nameVal.length < 2) {
          if (errEl) errEl.textContent = "Please enter your full name or company name.";
          return;
        }
        if (!/^\d{10}$/.test(phoneVal.replace(/\D/g, "").slice(-10))) {
          if (errEl) errEl.textContent = "Please enter a valid 10-digit mobile number.";
          return;
        }
        if (!addressVal || addressVal.length < 8) {
          if (errEl) errEl.textContent = "Please enter your complete delivery site address & pincode.";
          return;
        }
        if (errEl) errEl.textContent = "";

        var lines = [
          "*NEW ORDER — BUILDKART*",
          "------------------------",
          "*Customer:* " + nameVal,
          "*Phone:* " + phoneVal,
          "*Site Address:* " + addressVal,
          "*Payment Mode:* " + paymentMethod,
          "",
          "*Order Items:*"
        ];

        for (var i = 0; i < totals.items.length; i++) {
          var item = totals.items[i];
          lines.push(
            (i + 1) + ". " + item.product.name +
            " — Qty: " + item.quantity + " (" + item.product.unit + ") = " + formatINR(item.lineTotal)
          );
        }

        lines.push("");
        lines.push("*Subtotal:* " + formatINR(totals.subtotal));
        lines.push("*Delivery:* " + (totals.deliveryFee === 0 ? "FREE" : formatINR(totals.deliveryFee)));
        lines.push("*Grand Total:* " + formatINR(totals.total));

        // Log order locally so it appears immediately inside the Admin Orders Log
        var orderId = "BK-" + String(Date.now()).slice(-6);
        try {
          var existingOrdersRaw = localStorage.getItem("buildkart_orders_v1");
          var existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
          if (!Array.isArray(existingOrders)) existingOrders = [];
          existingOrders.unshift({
            orderId: orderId,
            createdAt: new Date().toISOString(),
            customerName: nameVal,
            customerPhone: phoneVal,
            siteAddress: addressVal,
            paymentMethod: paymentMethod,
            status: "Pending",
            items: totals.items.map(function (entry) {
              return {
                productId: entry.product.id,
                name: entry.product.name,
                unit: entry.product.unit,
                quantity: entry.quantity,
                price: entry.product.price,
                lineTotal: entry.lineTotal
              };
            }),
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            total: totals.total
          });
          localStorage.setItem("buildkart_orders_v1", JSON.stringify(existingOrders));
        } catch (err) {
          // Ignore storage error if private browsing restricts localStorage
        }

        var waUrl = buildWhatsAppLink(lines.join("\n"));
        window.open(waUrl, "_blank", "noopener,noreferrer");

        if (confirmationBox) {
          confirmationBox.hidden = false;
          confirmationBox.innerHTML =
            "<h4>Order #" + escapeHTML(orderId) + " Prepared for WhatsApp!</h4>" +
            "<p>Your itemized order for <strong>" + formatINR(totals.total) + "</strong> has been formatted for WhatsApp and logged. " +
            'If WhatsApp did not open automatically, <a href="' + escapeHTML(waUrl) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;font-weight:700;">tap here to send your order now</a>.</p>';
        }
      });
    }

    renderCart();
  }

  /* ------------------------------------------------------------------------
     10. Contact Page Form Initializer
     ------------------------------------------------------------------------ */
  function initContactPage() {
    var contactForm = document.getElementById("contact-enquiry-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = document.getElementById("contact-name").value.trim();
      var phone = document.getElementById("contact-phone").value.trim();
      var message = document.getElementById("contact-message").value.trim();
      var statusEl = document.getElementById("contact-form-status");

      if (!name || !phone || !message) {
        if (statusEl) {
          statusEl.textContent = "Please fill in your name, phone number, and material requirement.";
          statusEl.style.color = "#dc2626";
        }
        return;
      }

      var waMsg =
        "Hi BuildKart, Bulk / Site Enquiry:\n" +
        "• Name: " + name + "\n" +
        "• Phone: " + phone + "\n" +
        "• Requirement: " + message;

      var waUrl = buildWhatsAppLink(waMsg);
      window.open(waUrl, "_blank", "noopener,noreferrer");

      if (statusEl) {
        statusEl.style.color = "#15803d";
        statusEl.innerHTML =
          'Enquiry ready! <a href="' + escapeHTML(waUrl) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;font-weight:700;">Click here if WhatsApp did not open.</a>';
      }
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     11. Boot Storefront on DOM Ready
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    updateHeaderCartCount();
    initMobileMenu();
    initGlobalSearch();
    initFloatingWhatsApp();
    bindGlobalAddToCart();
    initGradeGuide();
    initHomePage();
    initShopPage();
    initProductPage();
    initCartPage();
    initContactPage();
  });
})();
