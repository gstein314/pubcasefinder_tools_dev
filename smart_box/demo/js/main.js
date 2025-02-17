document.addEventListener('selectedSmartBoxLabel', function (event) {
  const smartBoxId = event.detail.smartBoxId;
  const labelInfo = event.detail.labelInfo;
  switch (smartBoxId) {
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
      console.error('Unknown input box ID:', smartBoxId);
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
