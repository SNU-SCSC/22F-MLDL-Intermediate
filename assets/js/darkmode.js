const mode = document.getElementById('mode');

if (mode !== null) {

  let background = window.getComputedStyle(document.body ,null).backgroundColor;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', background);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {

    if (event.matches) {

      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-dark-mode', '');

    } else {

      localStorage.setItem('theme', 'light');
      document.documentElement.removeAttribute('data-dark-mode');

    }

    let background = window.getComputedStyle(document.body ,null).backgroundColor;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', background);

  })

  mode.addEventListener('click', () => {

    document.documentElement.toggleAttribute('data-dark-mode');
    localStorage.setItem('theme', document.documentElement.hasAttribute('data-dark-mode') ? 'dark' : 'light');

    let background = window.getComputedStyle(document.body ,null).backgroundColor;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', background);

  });

  if (localStorage.getItem('theme') === 'dark') {

    document.documentElement.setAttribute('data-dark-mode', '');

  } else {

    document.documentElement.removeAttribute('data-dark-mode');

  }

}
