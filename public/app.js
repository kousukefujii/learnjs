'use strict';

let learnjs = {};

// 問題データ
learnjs.problems = [
  {
    description: 'What is truth?',
    code: 'function problem() { return __; }'
  },
  {
    description: 'Simple Math',
    code: 'function problemView() { return 42 === 6 * __ }'
  }
];

learnjs.appOnReady = () => {
  window.onhashchange = (e) => {
    learnjs.showView(window.location.hash);
  };
  learnjs.showView(window.location.hash);
};

learnjs.problemView = (num) => {
  const title = `Problem #${num}`;
  const $view = $('.templates .problem-view').clone();
  const problem = learnjs.problems[num / 1 - 1];

  $view.find('.title').text(title);
  learnjs.applyObject(problem, $view);

  return $view;
};

learnjs.applyObject = (problem, $template) => {
  for (let key in problem) {
    $template.find(`[data-name=${key}]`).text(problem[key]);
  }
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
