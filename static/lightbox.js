// Click-to-zoom lightbox for blog images
(function () {
  document.addEventListener('click', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG' || !img.closest('article')) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    var clone = document.createElement('img');
    clone.src = img.src;
    clone.alt = img.alt || '';
    overlay.appendChild(clone);
    document.body.appendChild(overlay);

    // Force reflow then activate for CSS transition
    overlay.offsetHeight;
    overlay.classList.add('active');

    overlay.addEventListener('click', function () {
      overlay.classList.remove('active');
      setTimeout(function () { overlay.remove(); }, 300);
    });
  });
})();
