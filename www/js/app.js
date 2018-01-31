// カウント数
let count = [0,0,0];

ons.ready(function() {
  
  // ラベルタップ時の処理
  $('#dataLabels ons-button').on('click', (event) => {
    // 新しいラベルを入力させる
    let value = prompt('新しいラベルを入力してください');
    $(event.target).text(value);
  });
  
  // +ボタンタップ時の処理
  $('#plusButtons ons-button').each((index, elm) => {
    $(elm).on('click', (event) => {
      // カウントに1加算
      count[index]++;
      $('#countLabels span').eq(index).text(count[index]);
    });
  });

  // -ボタンタップ時の処理
  $('#minusButtons ons-button').each((index, elm) => {
    $(elm).on('click', (event) => {
      // カウントから1減算
      count[index]--;
      $('#countLabels span').eq(index).text(count[index]);
    });
  });

  // リセットボタンタップ時の処理
  $('#resetButton').on('click', () => {
    // カウントをすべて0にする
    count = [0,0,0];
    $('#countLabels span').each((index, elm) => {
      $(elm).text(count[index]);
    })
  });
  
  // 保存ボタンタップ時の処理
  $('#saveButton').on('click', () => {
    // ローカルストレージに保存
    util.saveItem();
  });
  
  // 分析結果の確認ボタンタップ時の処理
  $('#analyzeButton').on('click', () => {
    // 保存済みの全データを取得
    let items = util.getItems();
    // 値の部分のみをArray型で抽出
    let values = Object.values(items);
    // 2次元配列の行と列を入れ替える
    let targetData = _.zip.apply(this, values);
    
    // 分散分析
    let anovaPvalue = jStat.anovaftest.apply(this, targetData);
    let message = '';
    if (anovaPvalue < 0.01){
      message += '3グループの母平均に差があります<br>';
    } else {
      message += '3グループの母平均に差はありません<br>';
    }
    console.log(anovaPvalue);
    
    // テューキーの多重比較検定
    let tukeyPvalue = jStat.tukeyhsd(targetData);
    console.log(tukeyPvalue);
    tukeyPvalue.forEach((value) => {
      let factor1 = value[0][0];
      let factor2 = value[0][1];
      let p = value[1];
      if(p < 0.01){
        message += $('#dataLabels ons-button').eq(factor1).text() + 'と';
        message += $('#dataLabels ons-button').eq(factor2).text() + '間に差があります<br>';
      }  
    });
    ons.notification.alert({message:message, title:'分析結果'});
  });
  
});

// ローカルストレージ操作関連
let util = {
  // ローカルストレージのデータを取得
  getItems: () => {
    let localData = localStorage.getItem('count_data');
    if(localData !== null) {
      // ローカルストレージにデータがあれば、オブジェクト型に復元して返す
      return JSON.parse(localData);
    } else {
      // なければ、空のオブジェクトを返す
      return {};
    }
  },
  // 今日のデータを保存
  saveItem: () => {
    // 今日の日付をyyyy-MM-dd形式にする
    let date = new Date();
    let today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    // ローカルストレージのデータを取得
    let items = util.getItems();
    if(today in items) {
      // 既に今日の分のデータが保存済みの場合
      let result = confirm('本日分のデータを上書きしますか？')
      if (!result) return;
    }
    // 今日のデータをオブジェクトにセット
    //items[today] = count;
    items['2018-02-01']=[35,40,60];
    items['2018-02-02']=[31,39,55];
    items['2018-02-03']=[37,52,57];
    items['2018-02-04']=[40,45,66];
    items['2018-02-05']=[32,48,68];
    
    // ローカルストレージに保存
    localStorage.setItem('count_data', JSON.stringify(items));
    alert('保存しました');
  }
};
