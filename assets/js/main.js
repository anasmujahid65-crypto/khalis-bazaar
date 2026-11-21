/**
 * KHALIS BAZAAR — Bespoke Client Architecture
 * Artisanal Organic Harvest E-Commerce
 */

(function() {
  'use strict';

  var defaultCart = [
    {
      id: 'sidr-honey-500g',
      title: 'Wild Sidr (Beri) Honey',
      variant: '500g Glass Jar',
      price: 2200,
      qty: 1,
      image: 'assets/images/honey.webp'
    },
    {
      id: 'swat-walnuts-1kg',
      title: 'Swat Paper-Shell Walnuts',
      variant: '1kg Pack',
      price: 3200,
      qty: 1,
      image: 'assets/images/walnuts.webp'
    }
  ];

  function getCart() {
    try {
      var saved = localStorage.getItem('khalis_cart');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultCart.slice();
  }

  function saveCart(cart) {
    try {
      localStorage.setItem('khalis_cart', JSON.stringify(cart));
    } catch(e) {}
    updateCartUI();
  }

  function showToast(message) {
    var toast = document.getElementById('kb-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'kb-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="font-medium text-sm text-stone-100">${message}</span>
    `;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
      toast.classList.remove('show');
    }, 2800);
  }

  function updateCartUI() {
    var cart = getCart();
    var totalQty = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
    var subtotal = cart.reduce(function(sum, item) { return sum + (item.price * item.qty); }, 0);

    // Update Badges on All Pages
    var cartCountEls = document.querySelectorAll('.cart-count-badge, .cart-toggle-btn span');
    cartCountEls.forEach(function(el) {
      el.textContent = `Basket (${totalQty})`;
    });

    // Update Drawer Elements if present
    var cartItemsContainer = document.getElementById('cart-items-container');
    var cartSubtotalEl = document.getElementById('cart-subtotal-val');
    var cartTotalEl = document.getElementById('cart-total-val');
    var freeShipProgress = document.getElementById('free-shipping-progress');
    var freeShipText = document.getElementById('free-shipping-text');
    var emptyCartMsg = document.getElementById('cart-empty-msg');
    var whatsappCheckoutBtn = document.getElementById('cart-whatsapp-checkout');

    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = 'PKR ' + subtotal.toLocaleString();
    }
    if (cartTotalEl) {
      var delivery = (subtotal >= 5000 || subtotal === 0) ? 0 : 250;
      cartTotalEl.textContent = 'PKR ' + (subtotal + delivery).toLocaleString();
    }

    if (freeShipProgress && freeShipText) {
      var threshold = 5000;
      if (subtotal >= threshold && subtotal > 0) {
        freeShipProgress.style.width = '100%';
        freeShipText.innerHTML = '<span class="text-emerald-400 font-semibold flex items-center gap-1.5"><svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Shandar! Free Delivery Nationwide Unlocked</span>';
      } else {
        var pct = Math.min(100, Math.round((subtotal / threshold) * 100));
        var remaining = threshold - subtotal;
        freeShipProgress.style.width = pct + '%';
        freeShipText.innerHTML = `Add <span class="text-amber-400 font-semibold">PKR ${remaining.toLocaleString()}</span> more for Free Delivery`;
      }
    }

    if (cartItemsContainer) {
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div id="cart-empty-msg" class="py-14 text-center text-stone-400 space-y-4">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-center text-stone-500">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div>
              <p class="text-base text-stone-200 font-semibold">Your harvest basket is empty</p>
              <p class="text-xs text-stone-400 mt-1">Select from our cold-extracted raw honey or mountain dry fruits.</p>
            </div>
            <a href="shop.html" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/35 text-xs font-semibold hover:bg-amber-500/25 transition-all">
              <span>Browse 2026 Harvest</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
        `;
      } else {
        cartItemsContainer.innerHTML = cart.map(function(item, idx) {
          return `
            <div class="flex items-center gap-3.5 py-3.5 border-b border-stone-800/80 group">
              <img src="${item.image}" alt="${item.title}" class="w-16 h-16 rounded-xl object-cover border border-stone-700/60 shrink-0 bg-stone-950">
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-stone-100 truncate">${item.title}</h4>
                <p class="text-xs text-stone-400">${item.variant}</p>
                <div class="flex items-center justify-between gap-3 mt-2">
                  <div class="flex items-center border border-stone-700 rounded-lg bg-stone-900/90 overflow-hidden">
                    <button type="button" onclick="window.khalisChangeQty(${idx}, -1)" aria-label="Decrease quantity" class="px-2.5 py-1 text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors">-</button>
                    <span class="px-2.5 py-1 text-xs text-stone-100 font-semibold">${item.qty}</span>
                    <button type="button" onclick="window.khalisChangeQty(${idx}, 1)" aria-label="Increase quantity" class="px-2.5 py-1 text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors">+</button>
                  </div>
                  <span class="text-xs font-semibold text-amber-400">PKR ${(item.price * item.qty).toLocaleString()}</span>
                </div>
              </div>
              <button type="button" onclick="window.khalisRemoveItem(${idx})" aria-label="Remove item" class="text-stone-500 hover:text-rose-400 p-1.5 transition-colors" title="Remove item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          `;
        }).join('');
      }
    }

    if (whatsappCheckoutBtn) {
      if (cart.length > 0) {
        var lines = cart.map(function(item) {
          return `• ${item.title} (${item.variant}) x${item.qty} = PKR ${(item.price * item.qty).toLocaleString()}`;
        });
        var msg = `Salam Khalis Bazaar! I would like to order the following pure harvest items:\n\n${lines.join('\n')}\n\n*Total Payable: PKR ${subtotal.toLocaleString()}*\nDelivery: Cash on Delivery (COD)\nPlease confirm dispatch.`;
        whatsappCheckoutBtn.href = 'https://wa.me/923001234567?text=' + encodeURIComponent(msg);
      } else {
        whatsappCheckoutBtn.href = 'https://wa.me/923001234567';
      }
    }
  }

  // Global methods for Cart manipulation
  window.khalisChangeQty = function(index, delta) {
    var cart = getCart();
    if (cart[index]) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart(cart);
    }
  };

  window.khalisRemoveItem = function(index) {
    var cart = getCart();
    if (cart[index]) {
      var removed = cart.splice(index, 1);
      saveCart(cart);
      if (removed[0]) {
        showToast('Removed ' + removed[0].title);
      }
    }
  };

  window.khalisAddToCart = function(item) {
    var cart = getCart();
    var existing = cart.find(function(i) {
      return i.id === item.id;
    });
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      cart.push({
        id: item.id || ('kb-' + Date.now()),
        title: item.title,
        variant: item.variant || 'Standard Pack',
        price: Number(item.price),
        qty: item.qty || 1,
        image: item.image || 'assets/images/honey.webp'
      });
    }
    saveCart(cart);
    showToast(`✓ Added ${item.title} to Basket`);
    window.openCartDrawer();
  };

  // Drawer Toggle
  window.openCartDrawer = function() {
    var drawer = document.getElementById('cart-drawer');
    var backdrop = document.getElementById('cart-drawer-backdrop');
    var panel = document.getElementById('cart-drawer-panel');
    if (!drawer || !backdrop || !panel) return;
    drawer.classList.remove('pointer-events-none');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
  };

  window.closeCartDrawer = function() {
    var drawer = document.getElementById('cart-drawer');
    var backdrop = document.getElementById('cart-drawer-backdrop');
    var panel = document.getElementById('cart-drawer-panel');
    if (!drawer || !backdrop || !panel) return;
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');
    setTimeout(function() {
      drawer.classList.add('pointer-events-none');
    }, 280);
  };

  // Search Modal
  window.openSearchModal = function() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    var input = document.getElementById('search-modal-input');
    if (input) {
      setTimeout(function() { input.focus(); }, 60);
    }
  };

  window.closeSearchModal = function() {
    var modal = document.getElementById('search-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // Global Keyboard shortcuts: Ctrl+K / Escape
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      window.openSearchModal();
    }
    if (e.key === 'Escape') {
      window.closeSearchModal();
      window.closeCartDrawer();
    }
  });

  // Initialization
  document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();

    // Attach Add to Cart listener on all add-to-cart buttons
    document.querySelectorAll('.add-to-cart-action').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var title = btn.getAttribute('data-product-title') || 'Raw Organic Product';
        var price = btn.getAttribute('data-product-price') || 2200;
        var variant = btn.getAttribute('data-product-variant') || 'Standard Pack';
        var image = btn.getAttribute('data-product-image') || 'assets/images/honey.webp';
        var id = btn.getAttribute('data-product-id') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        window.khalisAddToCart({
          id: id,
          title: title,
          variant: variant,
          price: parseInt(price, 10),
          qty: 1,
          image: image
        });
      });
    });

    // Mobile menu toggle
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', function() {
        var isHidden = mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', !isHidden);
      });
    }

    // Interactive Weight Chips
    document.querySelectorAll('.weight-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var parent = chip.closest('.product-card, .product-detail-wrap');
        if (!parent) return;
        parent.querySelectorAll('.weight-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');

        var newPrice = chip.getAttribute('data-price');
        var newWeight = chip.getAttribute('data-weight');
        var priceDisplay = parent.querySelector('.product-price-val');
        if (priceDisplay && newPrice) {
          priceDisplay.textContent = 'PKR ' + parseInt(newPrice, 10).toLocaleString();
        }

        var addBtn = parent.querySelector('.add-to-cart-action');
        if (addBtn) {
          if (newPrice) addBtn.setAttribute('data-product-price', newPrice);
          if (newWeight) addBtn.setAttribute('data-product-variant', newWeight);
        }
      });
    });

    // Instant Filter in Search Modal
    var searchInput = document.getElementById('search-modal-input');
    var searchResults = document.querySelectorAll('.search-result-item');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var query = searchInput.value.toLowerCase().trim();
        searchResults.forEach(function(item) {
          var title = (item.getAttribute('data-title') || '').toLowerCase();
          if (!query || title.indexOf(query) !== -1) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    }
  });

})();