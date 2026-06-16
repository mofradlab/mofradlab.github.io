// Open external links in a new tab.
// Applies to any <a href> whose value begins with http:// or https://,
// skipping anchors that already declare a target attribute.
(function () {
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (
      href &&
      (href.startsWith('http://') || href.startsWith('https://')) &&
      !a.hasAttribute('target')
    ) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
})();
