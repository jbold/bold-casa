// Click-to-zoom lightbox for blog images
(function(){
  var overlay = null;
  function open(src, alt) {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.classList.add('active'); });
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(function(){ 
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }, 250);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('click', function(e) {
    var img = e.target;
    if (img.tagName === 'IMG' && img.closest('.prose')) {
      e.preventDefault();
      open(img.src, img.alt);
    }
  });
})();
