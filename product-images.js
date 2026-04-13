// Centralized product image settings.
// Update this file to change product images globally.
// Each id can provide:
// - img: main image for list/detail default
// - gallery: optional array for detail thumbnails
window.PRODUCT_IMAGE_MAP = {
  1: {
    img: 'pics/Black.jpg',
    gallery: [
      { thumb: 'pics/Black.jpg', full: 'pics/Black.jpg' },
      { thumb: 'pics/Brown.jpg', full: 'pics/Brown.jpg' },
      { thumb: 'pics/camel.jpg', full: 'pics/camel.jpg' },
      { thumb: 'pics/Navy_blue.jpg', full: 'pics/Navy_blue.jpg' },
    ],
  },
  2: { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=90' },
  3: { img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=90' },
  4: { img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=90' },
  5: { img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=900&q=90' },
  6: { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=90' },
  7: { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=90' },
  8: { img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=90' },
  9: { img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=900&q=90' },
  10: { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=90' },
  11: { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=90' },
  12: { img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=90' },
};

function applyMappedCardImages() {
  const cards = document.querySelectorAll('.product-card[onclick*="product-detail.html?id="]');
  cards.forEach((card) => {
    const onclickText = card.getAttribute('onclick') || '';
    const match = onclickText.match(/id=(\d+)/);
    if (!match) return;

    const productId = Number(match[1]);
    const mapped = window.PRODUCT_IMAGE_MAP?.[productId];
    if (!mapped || !mapped.img) return;

    const imgEl = card.querySelector('.product-img');
    if (imgEl) imgEl.src = mapped.img;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyMappedCardImages);
} else {
  applyMappedCardImages();
}
