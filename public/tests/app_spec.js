describe('LearnJS', () => {
  it('can show a problem view', () => {
    learnjs.showView('#problem-1');
    expect($('.view-container .problem-view').length).toEqual(1);
  });

  // hashがからのときのアサーション
  it('shows the landing page view whehn there is no hash.', () => {
    learnjs.showView('');
    expect($('.view-container .landing-view').length).toEqual(1);
  });

  // showView()がproblemView() に正しくパラメータを渡しているか
  it(
    'passes the hash view parameter to the view function',
    () => {
      spyOn(learnjs, 'problemView');
      learnjs.showView('#problem-42');
      expect(learnjs.problemView).toHaveBeenCalledWith('42');
    }
  );

  // 画面初期化
  it('invokes the router when laoded', ()  => {
    spyOn(learnjs, 'showView');
    learnjs.appOnReady();
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  // hashChangesイベント発火時にshowView()が呼ばれる
  it('subscribes to the hash change event', () => {
    learnjs.appOnReady();
    spyOn(learnjs, 'showView');
    $(window).trigger('hashchange');
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  describe('problem view', () => {
    it('has a title that includes the problem number',
      () => {
        const $view = learnjs.problemView('1');
        expect($view.find('.title').text().trim()).toEqual('Problem #1');
      }
    );
  });
});
