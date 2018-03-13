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
    code: 'function problem() { return 42 === 6 * __ }'
  }
];

learnjs.appOnReady = () => {
  window.onhashchange = (e) => {
    learnjs.showView(window.location.hash);
  };
  learnjs.showView(window.location.hash);
};

learnjs.getTemplate = (name) => {
  const $template = $(`.templates .${name}`);
  return $template.clone();
};

learnjs.problemView = (num) => {
  const title = `Problem #${num}`;
  const $view = learnjs.getTemplate('problem-view');
  const problem = learnjs.problems[num / 1 - 1];
  const $result = $('.result', $view);
  const $answer = $('.answer', $view);

  const isCorrect = () => {
    const answer = $answer.val();
    const test = problem.code.replace('__', answer) + '; problem();';
    return eval(test);
  };

  const flashResult = function(e) {
    e.preventDefault();
    let $resultContent;
    if (isCorrect()) {
      $resultContent = learnjs.getTemplate('correct-flash');
      $('a', $resultContent).attr('href' , `#problem-${num / 1 + 1}`);
    } else {
      $resultContent = $('<span>').text('Incollect!');
    }

    $result.html($resultContent);
  };

  $view.find('.title').text(title);
  learnjs.applyObject(problem, $view);

  // クリックイベントをアサイン
  $('.check-btn', $view).click(flashResult);

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
