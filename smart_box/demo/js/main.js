import { smartBox } from '../../smart_box.js';

// API（もしかして検索）あり、キーワード選択欄なし、最大表示数指定：5
smartBox('NANDO', './tsv/NANDO_sample.tsv', {
  api_url: 'http://localhost:5555/moshikashite_test_api?text=',
  max_results: 5,
});

// API（もしかして検索）あり、キーワード選択欄あり
smartBox('MONDO', './tsv/mondo_sample.tsv', {
  api_url: 'http://localhost:5555/moshikashite_test_api?text=',
  include_no_match: true,
});

// API（もしかして検索）なし、キーワード選択欄なし
smartBox('ICD10', './tsv/icd10_sample.tsv');

document.addEventListener('selectedLabel', function (event) {
  const inputBoxId = event.detail.inputBoxId;
  const labelInfo = event.detail.labelInfo;
  switch (inputBoxId) {
    case 'NANDO':
      console.log('NANDO:', labelInfo);
      break;
    case 'MONDO':
      console.log('MONDO:', labelInfo);
      break;
    case 'ICD10':
      console.log('ICD10:', labelInfo);
      break;
    default:
      console.error('Unknown input box ID:', inputBoxId);
  }
});

// デモ用（言語切替）
window.switchLanguage = function (lang) {
  const htmlElement = document.documentElement;
  htmlElement.lang = lang;

  document.querySelectorAll('.language-option').forEach((option) => {
    option.classList.remove('selected-language');
  });

  document.getElementById(`lang-${lang}`).classList.add('selected-language');
};

switchLanguage('ja');
