/* ==========================================================================
   BuildKart — Admin Panel Controller (Products, Orders, Settings & Export)
   ==========================================================================
   Works offline and on static hosts via localStorage overrides + 1-click
   products.js export for GitHub publishing.
   ========================================================================== */

(function () {
  "use strict";

  var ADMIN_PRODUCTS_KEY = "buildkart_admin_products_v1";
  var ADMIN_CONFIG_KEY = "buildkart_admin_config_v1";
  var ADMIN_ORDERS_KEY = "buildkart_orders_v1";
  var ADMIN_SESSION_KEY = "buildkart_admin_unlocked";

  var activeTab = "overview";
  var activeOrderStatusFilter = "All";
  var pendingDeleteProductId = null;
  var pendingDeleteOrderId = null;

  /* ------------------------------------------------------------------------
     1. Helpers
     ------------------------------------------------------------------------ */
  function formatINR(amount) {
    return "₹" + (Number(amount) || 0).toLocaleString("en-IN");
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var toastTimer = null;
  function showAdminToast(message) {
    var toast = document.getElementById("bk-admin-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "bk-admin-toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.innerHTML = "<span>" + escapeHTML(message) + "</span>";
    toast.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("visible");
    }, 2800);
  }

  function saveProductsState() {
    try {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(PRODUCTS));
    } catch (err) {
      // Ignore quota errors
    }
    refreshPublishPreview();
  }

  function saveConfigState() {
    try {
      localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(STORE_CONFIG));
    } catch (err) {
      // Ignore quota errors
    }
    refreshPublishPreview();
  }

  function getOrders() {
    try {
      var raw = localStorage.getItem(ADMIN_ORDERS_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveOrders(orders) {
    try {
      localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
    } catch (err) {
      // Ignore quota errors
    }
  }

  /* ------------------------------------------------------------------------
     2. Passcode Gate
     ------------------------------------------------------------------------ */
  function initPasscodeGate() {
    var gateEl = document.getElementById("admin-gate");
    var workspaceEl = document.getElementById("admin-workspace");
    var loginForm = document.getElementById("admin-login-form");
    var passInput = document.getElementById("admin-passcode-input");
    var togglePassBtn = document.getElementById("toggle-passcode-btn");
    var errEl = document.getElementById("admin-login-error");
    var lockBtn = document.getElementById("admin-lock-btn");

    function unlockWorkspace() {
      gateEl.hidden = true;
      workspaceEl.hidden = false;
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      } catch (err) {}
      renderAllTabs();
    }

    function lockWorkspace() {
      try {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      } catch (err) {}
      workspaceEl.hidden = true;
      gateEl.hidden = false;
      passInput.value = "";
      if (errEl) errEl.textContent = "";
    }

    // Auto-unlock if already verified in this tab session
    try {
      if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") {
        unlockWorkspace();
      }
    } catch (err) {}

    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener("click", function () {
        var isHidden = passInput.type === "password";
        passInput.type = isHidden ? "text" : "password";
        togglePassBtn.textContent = isHidden ? "Hide" : "Show";
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var expected = (STORE_CONFIG && STORE_CONFIG.adminPasscode) ? String(STORE_CONFIG.adminPasscode) : "4545";
        var entered = passInput.value.trim();

        if (entered === expected) {
          if (errEl) errEl.textContent = "";
          unlockWorkspace();
        } else {
          if (errEl) errEl.textContent = "Incorrect passcode. Please try again.";
          passInput.focus();
        }
      });
    }

    if (lockBtn) {
      lockBtn.addEventListener("click", lockWorkspace);
    }
  }

  /* ------------------------------------------------------------------------
     3. Tab Navigation
     ------------------------------------------------------------------------ */
  var TAB_TITLES = {
    overview: "Overview",
    products: "Product Management",
    orders: "Order Logs",
    settings: "Store Settings",
    publish: "Publish to GitHub"
  };

  function switchTab(tabName) {
    activeTab = tabName;
    var titleEl = document.getElementById("admin-active-title");
    if (titleEl) titleEl.textContent = TAB_TITLES[tabName] || "Overview";

    var navBtns = document.querySelectorAll("[data-admin-tab]");
    for (var i = 0; i < navBtns.length; i++) {
      navBtns[i].classList.toggle("active", navBtns[i].getAttribute("data-admin-tab") === tabName);
    }

    var panels = document.querySelectorAll(".admin-tab-panel");
    for (var j = 0; j < panels.length; j++) {
      panels[j].hidden = panels[j].id !== "tab-" + tabName;
    }

    if (tabName === "publish") {
      refreshPublishPreview();
    }
  }

  function initTabs() {
    document.addEventListener("click", function (event) {
      var navBtn = event.target.closest("[data-admin-tab]");
      if (navBtn) {
        switchTab(navBtn.getAttribute("data-admin-tab"));
        return;
      }

      var jumpBtn = event.target.closest("[data-jump-tab]");
      if (jumpBtn) {
        var target = jumpBtn.getAttribute("data-jump-tab");
        switchTab(target);
        if (jumpBtn.getAttribute("data-open-add-product") === "true") {
          openProductModal(null);
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Overview KPIs & Recent Orders
     ------------------------------------------------------------------------ */
  function renderOverview() {
    var kpiGrid = document.getElementById("admin-kpi-grid");
    var recentWrap = document.getElementById("overview-recent-orders");
    var prodSummaryEl = document.getElementById("hub-products-summary");
    var ordersSummaryEl = document.getElementById("hub-orders-summary");
    var settingsSummaryEl = document.getElementById("hub-settings-summary");
    if (!kpiGrid) return;

    var inStockCount = 0;
    var outOfStockCount = 0;
    var featuredCount = 0;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].inStock !== false) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
      if (PRODUCTS[i].featured) featuredCount++;
    }

    var orders = getOrders();
    var ordersRevenue = 0;
    var pendingOrders = 0;
    for (var j = 0; j < orders.length; j++) {
      ordersRevenue += Number(orders[j].total) || 0;
      if (orders[j].status === "Pending") pendingOrders++;
    }

    kpiGrid.innerHTML =
      '<div class="kpi-card"><span class="kpi-label">Total Materials</span><span class="kpi-value">' + PRODUCTS.length + "</span></div>" +
      '<div class="kpi-card"><span class="kpi-label">In Stock / Featured</span><span class="kpi-value">' + inStockCount + " / " + featuredCount + "</span></div>" +
      '<div class="kpi-card"><span class="kpi-label">Logged Orders</span><span class="kpi-value">' + orders.length + "</span></div>" +
      '<div class="kpi-card"><span class="kpi-label">Logged Order Value</span><span class="kpi-value">' + formatINR(ordersRevenue) + "</span></div>";

    if (prodSummaryEl) {
      prodSummaryEl.textContent =
        PRODUCTS.length + " materials · " + inStockCount + " in stock · " + outOfStockCount + " out of stock";
    }
    if (ordersSummaryEl) {
      ordersSummaryEl.textContent =
        orders.length + " logged · " + pendingOrders + " pending · " + formatINR(ordersRevenue) + " total";
    }
    if (settingsSummaryEl && typeof STORE_CONFIG !== "undefined") {
      settingsSummaryEl.textContent =
        "WhatsApp: +" + (STORE_CONFIG.whatsappNumber || "") + " · UPI: " + (STORE_CONFIG.upiId || "");
    }

    if (!recentWrap) return;
    if (orders.length === 0) {
      recentWrap.innerHTML =
        '<div style="padding: 16px 0 4px;">' +
        '  <p style="margin: 0 0 14px; color: var(--text-secondary);">Orders submitted on Cart &amp; Checkout appear here automatically, or you can log a phone order manually.</p>' +
        '  <button type="button" class="btn btn-primary" data-jump-tab="orders">Go to Order Logs</button>' +
        "</div>";
      return;
    }

    var rows = "";
    for (var k = 0; k < Math.min(5, orders.length); k++) {
      var ord = orders[k];
      var statusClass =
        ord.status === "Delivered"
          ? "status-delivered"
          : ord.status === "Confirmed"
            ? "status-confirmed"
            : "status-pending";
      rows +=
        '<div class="admin-recent-row">' +
        '  <div>' +
        '    <div style="font-weight:700;">' + escapeHTML(ord.customerName) + "</div>" +
        '    <div class="admin-item-meta mono-cell">' + escapeHTML(ord.orderId) + " · " + escapeHTML(ord.customerPhone) + "</div>" +
        "  </div>" +
        '  <div style="text-align:right;">' +
        '    <div class="mono-cell" style="font-weight:700;">' + formatINR(ord.total) + "</div>" +
        '    <div class="status-label ' + statusClass + '">' + escapeHTML(ord.status) + "</div>" +
        "  </div>" +
        "</div>";
    }

    recentWrap.innerHTML = '<div class="admin-recent-list">' + rows + "</div>";
  }

  /* ------------------------------------------------------------------------
     5. Products Manager (Card-Based Inline Price/Stock/Featured + Modal)
     ------------------------------------------------------------------------ */
  function renderProductsTable() {
    var listEl = document.getElementById("admin-products-list");
    var searchInput = document.getElementById("admin-prod-search");
    var catSelect = document.getElementById("admin-prod-cat");
    var countEl = document.getElementById("admin-prod-count");
    if (!listEl) return;

    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var cat = catSelect ? catSelect.value : "All";

    var filtered = [];
    for (var i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i];
      var matchCat = cat === "All" || p.category === cat;
      var matchQ =
        !q ||
        p.name.toLowerCase().indexOf(q) !== -1 ||
        p.brand.toLowerCase().indexOf(q) !== -1 ||
        p.gradeSpec.toLowerCase().indexOf(q) !== -1;
      if (matchCat && matchQ) filtered.push(p);
    }

    if (countEl) {
      countEl.textContent = filtered.length + " of " + PRODUCTS.length + " shown";
    }

    if (filtered.length === 0) {
      listEl.innerHTML =
        '<div class="empty-state" style="grid-column: 1 / -1;">' +
        "  <h3>No matching materials found</h3>" +
        "  <p>Try clearing your search or category filter, or add a new material.</p>" +
        '  <button type="button" id="empty-add-prod-btn" class="btn btn-primary">+ Add Material</button>' +
        "</div>";
      var emptyAdd = document.getElementById("empty-add-prod-btn");
      if (emptyAdd) emptyAdd.addEventListener("click", function () { openProductModal(null); });
      return;
    }

    var html = "";
    for (var j = 0; j < filtered.length; j++) {
      var item = filtered[j];
      var inStock = item.inStock !== false;
      var isConfirmingDelete = pendingDeleteProductId === item.id;

      html +=
        '<article class="admin-item-card">' +
        '  <div class="admin-item-head">' +
        '    <div class="admin-prod-cell">' +
        '      <img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.name) + '" class="admin-prod-thumb" referrerpolicy="no-referrer" />' +
        "      <div>" +
        '        <h3 class="admin-item-title">' + escapeHTML(item.name) + "</h3>" +
        '        <div class="admin-item-meta">' + escapeHTML(item.brand) + " · " + escapeHTML(item.category) + " · " + escapeHTML(item.unit) + "</div>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        '  <div class="admin-price-row">' +
        '    <label class="admin-price-label" for="price-input-' + item.id + '">Unit Price</label>' +
        '    <div class="admin-price-input-group">' +
        '      <span class="admin-currency-prefix">₹</span>' +
        '      <input type="number" inputmode="numeric" id="price-input-' + item.id + '" class="inline-price-input" data-inline-price="' + item.id + '" value="' + item.price + '" min="1" aria-label="Unit price for ' + escapeHTML(item.name) + '" />' +
        "    </div>" +
        "  </div>" +
        '  <div class="admin-toggle-row">' +
        '    <label class="admin-toggle-chip ' + (inStock ? "status-in-stock" : "status-out") + '">' +
        '      <input type="checkbox" data-toggle-stock="' + item.id + '" ' + (inStock ? "checked" : "") + " />" +
        "      <span>" + (inStock ? "In Stock" : "Out of Stock") + "</span>" +
        "    </label>" +
        '    <label class="admin-toggle-chip">' +
        '      <input type="checkbox" data-toggle-featured="' + item.id + '" ' + (item.featured ? "checked" : "") + " />" +
        "      <span>" + (item.featured ? "Featured" : "Standard") + "</span>" +
        "    </label>" +
        "  </div>" +
        '  <div class="admin-card-footer">' +
        '    <button type="button" class="btn btn-outline btn-sm" data-edit-product="' + item.id + '">Edit Details</button>' +
        (isConfirmingDelete
          ? '<button type="button" class="btn btn-primary btn-sm" style="background:var(--danger);" data-confirm-del-product="' + item.id + '">Confirm?</button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-cancel-del-product>No</button>'
          : '<button type="button" class="btn btn-danger-outline btn-sm" data-ask-del-product="' + item.id + '">Delete</button>') +
        "  </div>" +
        "</article>";
    }

    listEl.innerHTML = html;
  }

  function openProductModal(productId) {
    var backdrop = document.getElementById("product-modal-backdrop");
    var titleEl = document.getElementById("product-modal-title");
    var form = document.getElementById("admin-product-form");
    var presetSelect = document.getElementById("prod-image-preset");
    if (!backdrop || !form) return;

    form.reset();

    if (productId) {
      var prod = null;
      for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].id === Number(productId)) {
          prod = PRODUCTS[i];
          break;
        }
      }
      if (!prod) return;

      titleEl.textContent = "Edit Material #" + prod.id;
      document.getElementById("prod-id").value = String(prod.id);
      document.getElementById("prod-name").value = prod.name;
      document.getElementById("prod-brand").value = prod.brand;
      document.getElementById("prod-category").value = prod.category;
      document.getElementById("prod-unit").value = prod.unit;
      document.getElementById("prod-price").value = String(prod.price);
      document.getElementById("prod-min-order").value = String(prod.minOrder || 1);
      document.getElementById("prod-grade").value = prod.gradeSpec;
      document.getElementById("prod-image").value = prod.image;
      document.getElementById("prod-desc").value = prod.description;
      document.getElementById("prod-instock").checked = prod.inStock !== false;
      document.getElementById("prod-featured").checked = Boolean(prod.featured);

      var specLines = [];
      var keys = Object.keys(prod.specs || {});
      for (var k = 0; k < keys.length; k++) {
        specLines.push(keys[k] + ": " + prod.specs[keys[k]]);
      }
      document.getElementById("prod-specs").value = specLines.join("\n");

      if (presetSelect) {
        var matchedPreset = false;
        for (var optIdx = 0; optIdx < presetSelect.options.length; optIdx++) {
          if (presetSelect.options[optIdx].value === prod.image) {
            presetSelect.value = prod.image;
            matchedPreset = true;
            break;
          }
        }
        if (!matchedPreset) presetSelect.value = "custom";
      }
    } else {
      titleEl.textContent = "Add New Material";
      document.getElementById("prod-id").value = "";
      document.getElementById("prod-image").value = "images/cement.jpg";
      if (presetSelect) presetSelect.value = "images/cement.jpg";
      document.getElementById("prod-instock").checked = true;
    }

    backdrop.hidden = false;
  }

  function closeProductModal() {
    var backdrop = document.getElementById("product-modal-backdrop");
    if (backdrop) backdrop.hidden = true;
  }

  function initProductsManager() {
    var searchInput = document.getElementById("admin-prod-search");
    var catSelect = document.getElementById("admin-prod-cat");
    var addBtn = document.getElementById("add-product-btn");
    var closeBtn = document.getElementById("close-product-modal");
    var cancelBtn = document.getElementById("cancel-product-modal");
    var form = document.getElementById("admin-product-form");
    var presetSelect = document.getElementById("prod-image-preset");
    var imageInput = document.getElementById("prod-image");
    var listEl = document.getElementById("admin-products-list");

    if (searchInput) searchInput.addEventListener("input", renderProductsTable);
    if (catSelect) catSelect.addEventListener("change", renderProductsTable);
    if (addBtn) addBtn.addEventListener("click", function () { openProductModal(null); });
    if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeProductModal);

    if (presetSelect && imageInput) {
      presetSelect.addEventListener("change", function () {
        if (this.value !== "custom") {
          imageInput.value = this.value;
        }
      });
    }

    if (listEl) {
      listEl.addEventListener("change", function (event) {
        var priceEl = event.target.closest("[data-inline-price]");
        if (priceEl) {
          var pid = Number(priceEl.getAttribute("data-inline-price"));
          var val = parseInt(priceEl.value, 10);
          if (!isNaN(val) && val > 0) {
            for (var i = 0; i < PRODUCTS.length; i++) {
              if (PRODUCTS[i].id === pid) {
                PRODUCTS[i].price = val;
                saveProductsState();
                showAdminToast("Updated price for " + PRODUCTS[i].name + " to " + formatINR(val));
                break;
              }
            }
          }
          return;
        }

        var stockEl = event.target.closest("[data-toggle-stock]");
        if (stockEl) {
          var sid = Number(stockEl.getAttribute("data-toggle-stock"));
          for (var j = 0; j < PRODUCTS.length; j++) {
            if (PRODUCTS[j].id === sid) {
              PRODUCTS[j].inStock = stockEl.checked;
              saveProductsState();
              renderProductsTable();
              renderOverview();
              showAdminToast(PRODUCTS[j].name + (stockEl.checked ? " marked In Stock" : " marked Out of Stock"));
              break;
            }
          }
          return;
        }

        var featEl = event.target.closest("[data-toggle-featured]");
        if (featEl) {
          var fid = Number(featEl.getAttribute("data-toggle-featured"));
          for (var k = 0; k < PRODUCTS.length; k++) {
            if (PRODUCTS[k].id === fid) {
              PRODUCTS[k].featured = featEl.checked;
              saveProductsState();
              renderProductsTable();
              renderOverview();
              showAdminToast(PRODUCTS[k].name + (featEl.checked ? " added to Featured" : " removed from Featured"));
              break;
            }
          }
        }
      });

      listEl.addEventListener("click", function (event) {
        var editBtn = event.target.closest("[data-edit-product]");
        if (editBtn) {
          openProductModal(editBtn.getAttribute("data-edit-product"));
          return;
        }

        var askDelBtn = event.target.closest("[data-ask-del-product]");
        if (askDelBtn) {
          pendingDeleteProductId = Number(askDelBtn.getAttribute("data-ask-del-product"));
          renderProductsTable();
          return;
        }

        var cancelDelBtn = event.target.closest("[data-cancel-del-product]");
        if (cancelDelBtn) {
          pendingDeleteProductId = null;
          renderProductsTable();
          return;
        }

        var confirmDelBtn = event.target.closest("[data-confirm-del-product]");
        if (confirmDelBtn) {
          var delId = Number(confirmDelBtn.getAttribute("data-confirm-del-product"));
          PRODUCTS = PRODUCTS.filter(function (p) { return p.id !== delId; });
          pendingDeleteProductId = null;
          saveProductsState();
          renderProductsTable();
          renderOverview();
          showAdminToast("Material deleted from catalog.");
        }
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var editIdRaw = document.getElementById("prod-id").value;
        var name = document.getElementById("prod-name").value.trim();
        var brand = document.getElementById("prod-brand").value.trim();
        var category = document.getElementById("prod-category").value;
        var unit = document.getElementById("prod-unit").value.trim();
        var price = parseInt(document.getElementById("prod-price").value, 10) || 1;
        var minOrder = parseInt(document.getElementById("prod-min-order").value, 10) || 1;
        var gradeSpec = document.getElementById("prod-grade").value.trim();
        var image = document.getElementById("prod-image").value.trim() || "images/cement.jpg";
        var description = document.getElementById("prod-desc").value.trim();
        var inStock = document.getElementById("prod-instock").checked;
        var featured = document.getElementById("prod-featured").checked;

        var specsText = document.getElementById("prod-specs").value.trim();
        var specsObj = {};
        if (specsText) {
          var lines = specsText.split("\n");
          for (var l = 0; l < lines.length; l++) {
            var idx = lines[l].indexOf(":");
            if (idx > 0) {
              var k = lines[l].slice(0, idx).trim();
              var v = lines[l].slice(idx + 1).trim();
              if (k && v) specsObj[k] = v;
            }
          }
        }

        if (editIdRaw) {
          var targetId = Number(editIdRaw);
          for (var i = 0; i < PRODUCTS.length; i++) {
            if (PRODUCTS[i].id === targetId) {
              PRODUCTS[i].name = name;
              PRODUCTS[i].brand = brand;
              PRODUCTS[i].category = category;
              PRODUCTS[i].unit = unit;
              PRODUCTS[i].price = price;
              PRODUCTS[i].minOrder = minOrder;
              PRODUCTS[i].gradeSpec = gradeSpec;
              PRODUCTS[i].image = image;
              PRODUCTS[i].alt = name + " by " + brand;
              PRODUCTS[i].description = description;
              PRODUCTS[i].inStock = inStock;
              PRODUCTS[i].featured = featured;
              PRODUCTS[i].specs = specsObj;
              break;
            }
          }
          showAdminToast("Saved changes to " + name);
        } else {
          var maxId = 0;
          for (var m = 0; m < PRODUCTS.length; m++) {
            if (PRODUCTS[m].id > maxId) maxId = PRODUCTS[m].id;
          }
          PRODUCTS.push({
            id: maxId + 1,
            name: name,
            brand: brand,
            category: category,
            unit: unit,
            price: price,
            minOrder: minOrder,
            gradeSpec: gradeSpec,
            featured: featured,
            inStock: inStock,
            image: image,
            alt: name + " by " + brand,
            description: description,
            specs: specsObj
          });
          showAdminToast("Added new material: " + name);
        }

        saveProductsState();
        closeProductModal();
        renderProductsTable();
        renderOverview();
      });
    }
  }

  /* ------------------------------------------------------------------------
     6. Orders Log Manager
     ------------------------------------------------------------------------ */
  function renderOrdersLog() {
    var container = document.getElementById("admin-orders-container");
    if (!container) return;

    var orders = getOrders();
    var filtered = orders.filter(function (o) {
      return activeOrderStatusFilter === "All" || o.status === activeOrderStatusFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-state" style="grid-column: 1 / -1;">' +
        "  <h3>No orders in this view</h3>" +
        "  <p>Orders placed through Cart &amp; Checkout are logged here automatically, or you can log a phone order.</p>" +
        '  <button type="button" id="empty-log-order-btn" class="btn btn-primary">+ Log Manual Order</button>' +
        "</div>";
      var emptyBtn = document.getElementById("empty-log-order-btn");
      if (emptyBtn) emptyBtn.addEventListener("click", openOrderModal);
      return;
    }

    var cardsHtml = "";
    for (var i = 0; i < filtered.length; i++) {
      var ord = filtered[i];
      var itemsSummary = "";
      if (Array.isArray(ord.items) && ord.items.length > 0) {
        itemsSummary = ord.items.map(function (it) {
          return it.name + " (" + it.quantity + ")";
        }).join(", ");
      } else {
        itemsSummary = ord.manualSummary || "Custom material order";
      }

      var dateLabel = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today";
      var cleanCustPhone = String(ord.customerPhone || "").replace(/\D/g, "");
      var waPhone = cleanCustPhone.length === 10 ? "91" + cleanCustPhone : cleanCustPhone;
      var waReplyUrl = "https://wa.me/" + encodeURIComponent(waPhone) + "?text=" + encodeURIComponent(
        "Hello " + ord.customerName + ", regarding your BuildKart order " + ord.orderId + " (" + formatINR(ord.total) + "). Status: " + ord.status + "."
      );

      var statusClass =
        ord.status === "Delivered"
          ? "status-delivered"
          : ord.status === "Confirmed"
            ? "status-confirmed"
            : "status-pending";

      var isConfirmingDel = pendingDeleteOrderId === ord.orderId;

      cardsHtml +=
        '<article class="admin-item-card">' +
        '  <div class="admin-order-top">' +
        "    <div>" +
        '      <div class="mono-cell" style="font-weight:700;">' + escapeHTML(ord.orderId) + "</div>" +
        '      <div class="admin-item-meta">' + escapeHTML(dateLabel) + " · " + escapeHTML(ord.paymentMethod) + "</div>" +
        "    </div>" +
        '    <div class="admin-order-total">' + formatINR(ord.total) + "</div>" +
        "  </div>" +
        '  <div class="admin-order-details">' +
        '    <div style="font-weight:700; color: var(--text-primary);">' + escapeHTML(ord.customerName) + "</div>" +
        '    <a class="admin-order-phone" href="tel:' + escapeHTML(cleanCustPhone) + '">' + escapeHTML(ord.customerPhone) + "</a>" +
        '    <div style="font-size:13px; color:var(--text-secondary);">' + escapeHTML(ord.siteAddress) + "</div>" +
        "  </div>" +
        '  <div class="admin-order-items">' + escapeHTML(itemsSummary) + "</div>" +
        '  <div class="admin-order-controls">' +
        '    <select class="form-select ' + statusClass + '" aria-label="Status for order ' + escapeHTML(ord.orderId) + '" data-order-status-select="' + escapeHTML(ord.orderId) + '">' +
        '      <option value="Pending"' + (ord.status === "Pending" ? " selected" : "") + ">Pending</option>" +
        '      <option value="Confirmed"' + (ord.status === "Confirmed" ? " selected" : "") + ">Confirmed</option>" +
        '      <option value="Dispatched"' + (ord.status === "Dispatched" ? " selected" : "") + ">Dispatched</option>" +
        '      <option value="Delivered"' + (ord.status === "Delivered" ? " selected" : "") + ">Delivered</option>" +
        "    </select>" +
        '    <div class="admin-order-btn-row">' +
        '      <a href="' + waReplyUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">WhatsApp</a>' +
        (isConfirmingDel
          ? '<button type="button" class="btn btn-primary btn-sm" style="background:var(--danger);" data-confirm-del-order="' + escapeHTML(ord.orderId) + '">Confirm?</button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-cancel-del-order>No</button>'
          : '<button type="button" class="btn btn-danger-outline btn-sm" data-ask-del-order="' + escapeHTML(ord.orderId) + '">Delete</button>') +
        "    </div>" +
        "  </div>" +
        "</article>";
    }

    container.innerHTML = cardsHtml;
  }

  function escapeCSVField(value) {
    var str = value === null || value === undefined ? "" : String(value);
    str = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (/^[=+\-@\t]/.test(str) && !/^\+\d[\d\s-]*$/.test(str)) {
      str = "'" + str;
    }
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function formatDateYYYYMMDD(dateInput) {
    var d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return "";
    var yyyy = d.getFullYear();
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    return yyyy + "-" + mm + "-" + dd;
  }

  function formatOrderItemsForCSV(ord) {
    if (Array.isArray(ord.items) && ord.items.length > 0) {
      return ord.items.map(function (it) {
        var unitPart = it.unit ? " " + it.unit : "";
        var pricePart = typeof it.price === "number" ? " @ Rs." + it.price : "";
        return it.name + " (" + it.quantity + unitPart + pricePart + ")";
      }).join("; ");
    }
    return ord.manualSummary || "Custom material order";
  }

  function exportOrdersToCSV() {
    var orders = getOrders();
    var filtered = orders.filter(function (o) {
      return activeOrderStatusFilter === "All" || o.status === activeOrderStatusFilter;
    });

    if (filtered.length === 0) {
      showAdminToast("No orders in the current view to export.");
      return;
    }

    var headers = [
      "Order ID",
      "Date",
      "Time",
      "Customer Name",
      "Phone Number",
      "Site Address",
      "Materials Ordered",
      "Payment Mode",
      "Subtotal (INR)",
      "Delivery Fee (INR)",
      "Grand Total (INR)",
      "Status"
    ];

    var lines = [headers.map(escapeCSVField).join(",")];

    for (var i = 0; i < filtered.length; i++) {
      var ord = filtered[i];
      var createdDate = ord.createdAt ? new Date(ord.createdAt) : null;
      var hasValidDate = createdDate && !isNaN(createdDate.getTime());
      var dateStr = hasValidDate ? formatDateYYYYMMDD(createdDate) : "";
      var timeStr = hasValidDate
        ? createdDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
        : "";
      var totalVal = Number(ord.total) || 0;
      var deliveryVal = typeof ord.deliveryFee === "number" ? ord.deliveryFee : 0;
      var subtotalVal = typeof ord.subtotal === "number" ? ord.subtotal : totalVal;

      var row = [
        ord.orderId || "",
        dateStr,
        timeStr,
        ord.customerName || "",
        ord.customerPhone || "",
        ord.siteAddress || "",
        formatOrderItemsForCSV(ord),
        ord.paymentMethod || "",
        subtotalVal,
        deliveryVal,
        totalVal,
        ord.status || "Pending"
      ];

      lines.push(row.map(escapeCSVField).join(","));
    }

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens UTF-8 characters cleanly
    var csvContent = "\uFEFF" + lines.join("\r\n");
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var statusSlug = activeOrderStatusFilter === "All" ? "all" : activeOrderStatusFilter.toLowerCase();
    var fileName = "buildkart-orders-" + statusSlug + "-" + formatDateYYYYMMDD(new Date()) + ".csv";

    var a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

    showAdminToast("Exported " + filtered.length + " order" + (filtered.length === 1 ? "" : "s") + " to " + fileName);
  }

  function openOrderModal() {
    var backdrop = document.getElementById("order-modal-backdrop");
    var form = document.getElementById("admin-manual-order-form");
    if (form) form.reset();
    if (backdrop) backdrop.hidden = false;
  }

  function closeOrderModal() {
    var backdrop = document.getElementById("order-modal-backdrop");
    if (backdrop) backdrop.hidden = true;
  }

  function initOrdersManager() {
    var statusTabs = document.getElementById("order-status-tabs");
    var container = document.getElementById("admin-orders-container");
    var exportCsvBtn = document.getElementById("export-orders-csv-btn");
    var hubExportCsvBtn = document.getElementById("hub-export-csv-btn");
    var addBtn = document.getElementById("add-manual-order-btn");
    var closeBtn = document.getElementById("close-order-modal");
    var cancelBtn = document.getElementById("cancel-order-modal");
    var form = document.getElementById("admin-manual-order-form");

    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportOrdersToCSV);
    if (hubExportCsvBtn) hubExportCsvBtn.addEventListener("click", exportOrdersToCSV);
    if (addBtn) addBtn.addEventListener("click", openOrderModal);
    if (closeBtn) closeBtn.addEventListener("click", closeOrderModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeOrderModal);

    if (statusTabs) {
      statusTabs.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-order-status]");
        if (!btn) return;
        activeOrderStatusFilter = btn.getAttribute("data-order-status");
        var allBtns = statusTabs.querySelectorAll("[data-order-status]");
        for (var i = 0; i < allBtns.length; i++) {
          allBtns[i].classList.toggle("active", allBtns[i] === btn);
        }
        renderOrdersLog();
      });
    }

    if (container) {
      container.addEventListener("change", function (event) {
        var sel = event.target.closest("[data-order-status-select]");
        if (!sel) return;
        var orderId = sel.getAttribute("data-order-status-select");
        var orders = getOrders();
        for (var i = 0; i < orders.length; i++) {
          if (orders[i].orderId === orderId) {
            orders[i].status = sel.value;
            break;
          }
        }
        saveOrders(orders);
        renderOrdersLog();
        renderOverview();
        showAdminToast("Order " + orderId + " updated to " + sel.value);
      });

      container.addEventListener("click", function (event) {
        var askBtn = event.target.closest("[data-ask-del-order]");
        if (askBtn) {
          pendingDeleteOrderId = askBtn.getAttribute("data-ask-del-order");
          renderOrdersLog();
          return;
        }
        var cancelBtn = event.target.closest("[data-cancel-del-order]");
        if (cancelBtn) {
          pendingDeleteOrderId = null;
          renderOrdersLog();
          return;
        }
        var confirmBtn = event.target.closest("[data-confirm-del-order]");
        if (confirmBtn) {
          var delId = confirmBtn.getAttribute("data-confirm-del-order");
          var orders = getOrders().filter(function (o) { return o.orderId !== delId; });
          pendingDeleteOrderId = null;
          saveOrders(orders);
          renderOrdersLog();
          renderOverview();
          showAdminToast("Order " + delId + " removed.");
        }
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var orders = getOrders();
        var newId = "BK-" + String(Date.now()).slice(-6);
        orders.unshift({
          orderId: newId,
          createdAt: new Date().toISOString(),
          customerName: document.getElementById("ord-cust-name").value.trim(),
          customerPhone: document.getElementById("ord-cust-phone").value.trim(),
          siteAddress: document.getElementById("ord-address").value.trim(),
          manualSummary: document.getElementById("ord-summary").value.trim(),
          paymentMethod: document.getElementById("ord-payment").value,
          status: document.getElementById("ord-status").value,
          items: [],
          total: parseInt(document.getElementById("ord-total").value, 10) || 0
        });
        saveOrders(orders);
        closeOrderModal();
        renderOrdersLog();
        renderOverview();
        showAdminToast("Logged manual order #" + newId);
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. Store Settings Manager
     ------------------------------------------------------------------------ */
  function populateSettingsForm() {
    if (typeof STORE_CONFIG === "undefined") return;
    document.getElementById("set-store-name").value = STORE_CONFIG.storeName || "";
    document.getElementById("set-wa-number").value = STORE_CONFIG.whatsappNumber || "";
    document.getElementById("set-upi-id").value = STORE_CONFIG.upiId || "";
    document.getElementById("set-upi-qr").value = STORE_CONFIG.upiQrImage || "";
    document.getElementById("set-phone-display").value = STORE_CONFIG.supportPhoneDisplay || "";
    document.getElementById("set-email").value = STORE_CONFIG.supportEmail || "";
    document.getElementById("set-hours").value = STORE_CONFIG.dispatchHours || "";
    document.getElementById("set-city").value = STORE_CONFIG.warehouseCity || "";
    document.getElementById("set-passcode").value = STORE_CONFIG.adminPasscode || "4545";
  }

  function initSettingsManager() {
    var form = document.getElementById("admin-settings-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      STORE_CONFIG.storeName = document.getElementById("set-store-name").value.trim() || "BuildKart";
      STORE_CONFIG.whatsappNumber = document.getElementById("set-wa-number").value.replace(/\D/g, "") || "919876543210";
      STORE_CONFIG.upiId = document.getElementById("set-upi-id").value.trim() || "buildkart@upi";
      STORE_CONFIG.upiQrImage = document.getElementById("set-upi-qr").value.trim() || "images/upi-qr-placeholder.svg";
      STORE_CONFIG.supportPhoneDisplay = document.getElementById("set-phone-display").value.trim();
      STORE_CONFIG.supportEmail = document.getElementById("set-email").value.trim();
      STORE_CONFIG.dispatchHours = document.getElementById("set-hours").value.trim();
      STORE_CONFIG.warehouseCity = document.getElementById("set-city").value.trim();
      STORE_CONFIG.adminPasscode = document.getElementById("set-passcode").value.trim() || "4545";

      saveConfigState();
      renderOverview();
      showAdminToast("Store settings saved! Storefront updated.");
    });
  }

  /* ------------------------------------------------------------------------
     8. Export products.js & Reset Local Overrides
     ------------------------------------------------------------------------ */
  function generateProductsFileString() {
    return (
      "/* ==========================================================================\n" +
      "   BuildKart — Editable Product Catalog, Store Settings & Grade Guide\n" +
      "   Exported from BuildKart Admin Panel\n" +
      "   ========================================================================== */\n\n" +
      "var STORE_CONFIG = " + JSON.stringify(STORE_CONFIG, null, 2) + ";\n\n" +
      "var PRODUCTS = " + JSON.stringify(PRODUCTS, null, 2) + ";\n\n" +
      "var GRADE_GUIDE = " + JSON.stringify(GRADE_GUIDE, null, 2) + ";\n\n" +
      "/* ==========================================================================\n" +
      "   ADMIN PANEL LOCAL OVERRIDE HYDRATION\n" +
      "   ========================================================================== */\n" +
      "(function () {\n" +
      "  window.BUILDKART_DEFAULTS = {\n" +
      "    storeConfig: JSON.parse(JSON.stringify(STORE_CONFIG)),\n" +
      "    products: JSON.parse(JSON.stringify(PRODUCTS))\n" +
      "  };\n" +
      "  try {\n" +
      '    var savedConfig = localStorage.getItem("buildkart_admin_config_v1");\n' +
      "    if (savedConfig) {\n" +
      "      var parsedConfig = JSON.parse(savedConfig);\n" +
      '      if (parsedConfig && typeof parsedConfig === "object") {\n' +
      "        Object.keys(parsedConfig).forEach(function (k) { STORE_CONFIG[k] = parsedConfig[k]; });\n" +
      "      }\n" +
      "    }\n" +
      '    var savedProducts = localStorage.getItem("buildkart_admin_products_v1");\n' +
      "    if (savedProducts) {\n" +
      "      var parsedProducts = JSON.parse(savedProducts);\n" +
      "      if (Array.isArray(parsedProducts)) PRODUCTS = parsedProducts;\n" +
      "    }\n" +
      "  } catch (err) {}\n" +
      "})();\n"
    );
  }

  function refreshPublishPreview() {
    var previewBox = document.getElementById("export-code-preview");
    if (previewBox) {
      previewBox.value = generateProductsFileString();
    }
  }

  function downloadProductsFile() {
    var content = generateProductsFileString();
    var blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "products.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showAdminToast("Downloaded products.js — replace js/products.js on GitHub to publish.");
  }

  function initPublishManager() {
    var topExportBtn = document.getElementById("topbar-export-btn");
    var downloadBtn = document.getElementById("publish-download-btn");
    var copyBtn = document.getElementById("publish-copy-btn");
    var resetBtn = document.getElementById("publish-reset-btn");
    var resetBar = document.getElementById("reset-confirm-bar");
    var confirmYes = document.getElementById("confirm-reset-yes");
    var confirmNo = document.getElementById("confirm-reset-no");

    if (topExportBtn) topExportBtn.addEventListener("click", downloadProductsFile);
    if (downloadBtn) downloadBtn.addEventListener("click", downloadProductsFile);

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var code = generateProductsFileString();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            showAdminToast("Copied products.js code to clipboard!");
          });
        }
      });
    }

    if (resetBtn && resetBar) {
      resetBtn.addEventListener("click", function () {
        resetBar.hidden = false;
      });
    }

    if (confirmNo && resetBar) {
      confirmNo.addEventListener("click", function () {
        resetBar.hidden = true;
      });
    }

    if (confirmYes && resetBar) {
      confirmYes.addEventListener("click", function () {
        try {
          localStorage.removeItem(ADMIN_PRODUCTS_KEY);
          localStorage.removeItem(ADMIN_CONFIG_KEY);
        } catch (err) {}

        if (window.BUILDKART_DEFAULTS) {
          STORE_CONFIG = JSON.parse(JSON.stringify(window.BUILDKART_DEFAULTS.storeConfig));
          PRODUCTS = JSON.parse(JSON.stringify(window.BUILDKART_DEFAULTS.products));
        }

        resetBar.hidden = true;
        renderAllTabs();
        showAdminToast("Reverted local edits back to file defaults.");
      });
    }
  }

  /* ------------------------------------------------------------------------
     9. Render & Boot
     ------------------------------------------------------------------------ */
  function renderAllTabs() {
    renderOverview();
    renderProductsTable();
    renderOrdersLog();
    populateSettingsForm();
    refreshPublishPreview();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTabs();
    initProductsManager();
    initOrdersManager();
    initSettingsManager();
    initPublishManager();
    initPasscodeGate();
  });
})();
