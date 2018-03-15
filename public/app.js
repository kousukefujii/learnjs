'use strict';

let learnjs = {};

// cognit pool id
learnjs.poolId = 'ap-northeast-1:d7aae045-d4c1-4a2e-800d-d3a79b208b8a';
learnjs.identity = new $.Deferred;

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
  window.onhashchange = () => {
    learnjs.showView(window.location.hash);
  };
  learnjs.showView(window.location.hash);
  learnjs.identity.done(learnjs.addProfileLink);
};

learnjs.getTemplate = (name) => {
  const $template = $(`.templates .${name}`);
  return $template.clone();
};

learnjs.landingView = () => {
  const $template = learnjs.getTemplate('landing-view');
  return $template;
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
      learnjs.saveAnswer(num, $answer.val());
    } else {
      $resultContent = $('<span>').text('Incorrect!');
    }

    $result.html($resultContent);
  };

  $view.find('.title').text(title);
  learnjs.applyObject(problem, $view);

  // すでに答えていたとき
  learnjs.fetchAnswer(num).then((data) => {
    if (data.Item) {
      $answer.val(data.Item.answer);
    }
  });

  // クリックイベントをアサイン
  $('.check-btn', $view).click(flashResult);

  return $view;
};

learnjs.profileView = () => {
  const $view = learnjs.getTemplate('profile-view');
  learnjs.identity.done((identity) => {
    $('.email', $view).text(identity.email);
  });
  return $view;
};

learnjs.addProfileLink = (profile) => {
  const $view = learnjs.getTemplate('profile-link');
  $('a', $view).text(profile.email);
  $('.signin-bar').prepend($view);
};

learnjs.applyObject = (problem, $template) => {
  for (let key in problem) {
    $template.find(`[data-name=${key}]`).text(problem[key]);
  }
};

learnjs.showView = (hash) => {
  const routes = {
    '#problem': learnjs.problemView,
    '#profile': learnjs.profileView,
    '#': learnjs.landingView,
    '': learnjs.landingView,
  };

  const hashParams = hash.split('-');
  const $view = routes[hashParams[0]](hashParams[1]);

  $('.view-container').empty().append($view);
};

learnjs.awsRefresh = function() {
  var deferred = new $.Deferred();
  AWS.config.credentials.refresh(function(err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(AWS.config.credentials.identityId);
    }
  });
  return deferred.promise();
};

learnjs.sendDbRequest = (req, retry) => {
  const promise = new $.Deferred;
  req.on('error', (error) => {
    if (error.code == 'CredentialsError') {
      learnjs.identity.then((identity) => {
        return identity.refresh().then(() => {
          return retry();
        });
      }, () => {
        promise.reject(error);
      });
    } else {
      promise.reject(error);
    }
  });
  req.on('success', (resp) => {
    promise.resolve(resp.data);
  });
  req.send();
  return promise;
};

// 5.4.2 アイテムを作成して保存する
learnjs.saveAnswer = (problemId, answer) => {
  return learnjs.identity.then((identity) => {
    const db = new AWS.DynamoDB.DocumentClient();
    const item = {
      TableName: 'learnjs',
      Item: {
        userId: identity.id,
        problemId: problemId / 1,
        answer: answer,
      }
    };

    return learnjs.sendDbRequest(db.put(item), () => {
      return learnjs.saveAnswer(problemId, answer);
    });
  });
};

// 5.5 ドキュメントを取得する
learnjs.fetchAnswer = (problemId) => {
  return learnjs.identity.then((identity) => {
    const db = new AWS.DynamoDB.DocumentClient();
    const item = {
      TableName: 'learnjs',
      Key: {
        userId: identity.id,
        problemId: problemId / 1,
      }
    };

    return learnjs.sendDbRequest(db.get(item), () => {
      return learnjs.fetchAnswer(problemId);
    });
  });
};

$(() => {
  learnjs.appOnReady();
});

// Googleログイン時のコールバック
function googleSignIn(user)
{
  const token = user.getAuthResponse().id_token;

  AWS.config.update({
    region: 'ap-northeast-1',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: learnjs.poolId,
      Logins: {
        'accounts.google.com': token
      }
    })
  });

  const refresh = () => {
    return gapi.auth2.getAuthInstance().signIn({
      prompt: 'login'
    }).then((userUpdate) => {
      const creds = AWS.config.credentials;
      const newToken = userUpdate.getAuthResponse().id_token;
      creds.params.Logins['accounts.google.com'] = newToken;
      return learnjs.awsRefresh();
    });
  };

  learnjs.awsRefresh().then((id) => {
    learnjs.identity.resolve({
      id: id,
      email: user.getBasicProfile().getEmail(),
      refresh: refresh
    });
  });
}
const auth2 = gapi.auth2.init();
auth2.attachClickHandler($('.g-signin2')[0], {}, googleSignIn);

