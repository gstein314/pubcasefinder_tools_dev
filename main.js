// ツール情報をJSONファイルから読み込む
async function loadTools() {
  try {
    const response = await fetch('./tools.json');
    const data = await response.json();
    return data.tools;
  } catch (error) {
    console.error('ツール情報の読み込みに失敗しました:', error);
    return [];
  }
}

async function displayTools() {
  const directoryList = document.getElementById('directory-list');
  const tools = await loadTools();

  tools.forEach((tool) => {
    const card = document.createElement('div');
    card.className = 'tool-card';

    card.innerHTML = `
      <h2>${tool.displayName}</h2>
      <p>${tool.description}</p>
    `;

    card.addEventListener('click', () => {
      window.location.href = `./${tool.id}/`;
    });

    directoryList.appendChild(card);
  });
}

// ページ読み込み時にツール一覧を表示
document.addEventListener('DOMContentLoaded', displayTools);
