'use strict';

let learnjs = {};

learnjs.appOnReady = () => {
  window.onhashchange = (e) => {
    learnjs.showView(window.location.hash);
  };
  learnjs.showView(window.location.hash);
};

learnjs.problemView = (num) => {
  const title = `Problem #${num} coming soon`;
  return $('<div class="problem-view">').text(title);
};

learnjs.showView = (hash) => {
  if (!hash) {
    return;
  }

  const routes = {
    '#problem': learnjs.problemView,
  };

  const hashParams = hash.split('-');
  const $view = routes[hashParams[0]](hashParams[1]);
  $('.view-container').empty().append($view);
};

$(() => {
  learnjs.appOnReady();
});
