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
    Util.saveItem();
  });
  
  // 合計の確認ボタンタップ時の処理
  $('#sumButton').on('click', () => {
    // 保存済みの全データを取得
    let items = Util.getItems();
    // 値の部分のみをArray型で抽出
    let values = Object.values(items);
    // 2次元配列の列方向合計を得る
    let sumValues = jStat(values).sum();
    
    let message = '';
    sumValues.forEach((value, index) => {
      message += $('#dataLabels ons-button').eq(index).text();
      message += '：';
      message += value;
      message += '<br>';
    });
    ons.notification.alert({message:message, title:'合計'});
  });
  
  // 分析結果の確認ボタンタップ時の処理
  $('#analyzeButton').on('click', () => {
    // 保存済みの全データを取得
    let items = Util.getItems();
    // 値の部分のみをArray型で抽出
    let values = Object.values(items);
    // 2次元配列の行と列を入れ替える
    let groupData = jStat.transpose(values);
    
    // 分散分析
    let anovaPvalue = jStat.anovaftest.apply(this, groupData);
    console.log(anovaPvalue);
    let message = '';
    if (anovaPvalue < 0.05){
      message += '3グループ間の平均値に差があります<br>';
    } else {
      message += '3グループ間の平均値に差はありません<br>';
    }
    
    // テューキーの多重比較検定
    let tukeyPvalue = jStat.tukeyhsd(groupData);
    console.log(tukeyPvalue);
    tukeyPvalue.forEach((value) => {
      let factor1 = value[0][0];
      let factor2 = value[0][1];
      let p = value[1];
      if(p < 0.05){
        message += $('#dataLabels ons-button').eq(factor1).text() + 'と';
        message += $('#dataLabels ons-button').eq(factor2).text() + '間に差があります<br>';
      }  
    });
    ons.notification.alert({message:message, title:'分析結果'});
  });
  
});

// ローカルストレージ操作関連
class Util {
  // ローカルストレージのデータを取得
  static getItems() {
    let localData = localStorage.getItem('count_data');
    if(localData !== null) {
      // ローカルストレージにデータがあれば、オブジェクト型に復元して返す
      return JSON.parse(localData);
    } else {
      // なければ、空のオブジェクトを返す
      return {};
    }
  }
  // 今日のデータを保存
  static saveItem() {
    // 今日の日付をyyyy-MM-dd形式にする
    let date = new Date();
    let today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    // ローカルストレージのデータを取得
    let items = this.getItems();
    if(today in items) {
      // 既に今日の分のデータが保存済みの場合
      let result = confirm('本日分のデータを上書きしますか？')
      if (!result) return;
    }
    // 今日のデータをオブジェクトにセット
    items[today] = count;
    /*
    // テストデータ
    items = {};
    items['2018-02-01']=[40,50,60];
    items['2018-02-02']=[39,51,55];
    items['2018-02-03']=[52,46,57];
    items['2018-02-04']=[45,43,66];
    items['2018-02-05']=[48,62,68];
    */
    
    // ローカルストレージに保存
    localStorage.setItem('count_data', JSON.stringify(items));
    alert('保存しました');
  }
};
