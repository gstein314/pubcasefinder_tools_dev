// デモページの機能を管理するクラス
class SmartBoxDemo {
  constructor() {
    this.initializeEventListeners();
    this.currentConfig = {
      smartBoxId: '',
      dataSource: '', // デフォルト値を空に
      dataPath: '', // デフォルトパスも空に
      fileName: '', // ファイル名を保存するプロパティを追加
      apiUrl: '',
      includeKeyword: false,
      maxResults: '',
      placeholder: 'Search...',
    };

    // ブラウザの言語設定を確認して初期言語を設定
    const browserLang = document.documentElement.lang || 'en';
    const lang = browserLang.toLowerCase().startsWith('ja') ? 'ja' : 'en';
    this.switchLanguage(lang);

    // 初期表示
    this.updateSmartBox();
  }

  initializeEventListeners() {
    // Smart Box ID の入力監視
    const smartBoxIdInput = document.querySelector(
      'input[placeholder="SampleID"]'
    );
    smartBoxIdInput.addEventListener('input', (e) => {
      this.currentConfig.smartBoxId = e.target.value;
      this.updateSmartBox();
    });

    // データソースの選択
    document.querySelectorAll('.data-source-option').forEach((option) => {
      option.addEventListener('click', () => {
        this.selectDataSource(option);
      });
    });

    // アップロードタブの切り替え
    const uploadTabs = document.querySelectorAll('.upload-tab');
    const uploadArea = document.querySelector('.upload-area');
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'smart-box-input';
    urlInput.placeholder = 'Enter TSV file URL';

    uploadTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        uploadTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.textContent === 'Data URL') {
          uploadArea.style.display = 'none';
          uploadArea.parentNode.insertBefore(urlInput, uploadArea);
        } else {
          uploadArea.style.display = 'block';
          if (urlInput.parentNode) {
            urlInput.parentNode.removeChild(urlInput);
          }
        }
      });
    });

    // URLの入力監視
    urlInput.addEventListener('input', (e) => {
      // サンプルの選択を解除
      document.querySelectorAll('.data-source-option').forEach((opt) => {
        opt.classList.remove('active');
      });
      this.currentConfig.dataSource = '';
      this.currentConfig.dataPath = e.target.value;

      // URLが入力されている場合は表示を更新
      if (e.target.value) {
        const fileName = e.target.value.split('/').pop();
        urlInput.style.borderColor = '#635ccd';
      } else {
        urlInput.style.borderColor = '#e5e5e5';
      }

      this.updateSmartBox();
    });

    // ファイルドロップ処理
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#34508a';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '#ccc';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#ccc';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    // ファイルクリックアップロード
    uploadArea.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.tsv';
      input.onchange = (e) => {
        if (e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      };
      input.click();
    });

    // 言語切り替え
    document.querySelectorAll('.language-switcher a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchLanguage(e.target.textContent.toLowerCase());
      });
    });

    // コードのコピー機能
    document.querySelector('.copy-button').addEventListener('click', () => {
      this.copyCodeToClipboard();
    });

    // トグルスイッチの監視を修正
    const toggleSwitches = document.querySelectorAll('.toggle-switch');
    toggleSwitches.forEach((toggle) => {
      const input = toggle.querySelector('input[type="checkbox"]');

      // トグルスイッチ全体のクリックイベントを削除
      toggle.addEventListener('click', (e) => {
        e.preventDefault(); // デフォルトの動作を防止
        input.checked = !input.checked; // チェック状態を反転
        input.dispatchEvent(new Event('change')); // changeイベントを発火
      });

      // チェックボックスの変更イベントを監視
      input.addEventListener('change', () => {
        this.updateConfigFromInputs();
      });
    });

    // Smart Box設定の変更を監視
    this.watchConfigChanges();

    // ツールチップの制御を追加
    let activeTooltip = null;

    document.addEventListener('click', (e) => {
      const clickedIcon = e.target.closest('.info-icon');

      if (clickedIcon) {
        e.stopPropagation();
        const tooltip = clickedIcon.querySelector('.info-tooltip');

        // 他のツールチップを非表示
        document.querySelectorAll('.info-tooltip').forEach((t) => {
          if (t !== tooltip) {
            t.style.visibility = 'hidden';
          }
        });

        // 同じツールチップをクリックした場合は表示/非表示を切り替え
        if (activeTooltip === tooltip) {
          tooltip.style.visibility = 'hidden';
          activeTooltip = null;
        } else {
          tooltip.style.visibility = 'visible';
          activeTooltip = tooltip;
        }
      } else if (!e.target.closest('.info-tooltip')) {
        // ツールチップの外側をクリックした場合は全て非表示
        document.querySelectorAll('.info-tooltip').forEach((tooltip) => {
          tooltip.style.visibility = 'hidden';
        });
        activeTooltip = null;
      }
    });

    // ツールチップ内のクリックイベントの伝播を停止
    document.querySelectorAll('.info-tooltip').forEach((tooltip) => {
      tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // ツールチップの閉じるボタンのイベントリスナー
    document
      .querySelectorAll('.info-tooltip .close-button')
      .forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const tooltip = e.target.closest('.info-tooltip');
          tooltip.style.visibility = 'hidden';
          activeTooltip = null;
        });
      });
  }

  switchLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('.language-switcher a').forEach((link) => {
      link.classList.toggle('active', link.textContent.toLowerCase() === lang);
    });
    this.updateSmartBox();
  }

  selectDataSource(option) {
    // 同じオプションをクリックした場合は選択解除
    if (option.classList.contains('active')) {
      option.classList.remove('active');
      this.currentConfig.dataSource = '';
      this.currentConfig.dataPath = '';
      this.currentConfig.fileName = ''; // ファイル名もクリア

      // アップロードエリアをリセット
      this.resetUploadArea();
    } else {
      // 他のオプションの選択を解除
      document.querySelectorAll('.data-source-option').forEach((opt) => {
        opt.classList.remove('active');
      });
      // 新しいオプションを選択
      option.classList.add('active');
      const dataSource = option.textContent;
      this.currentConfig.dataSource = dataSource;
      this.currentConfig.fileName = ''; // ファイル名をクリア

      // データソースに応じたTSVファイルパスを設定
      switch (dataSource) {
        case 'NANDO':
          this.currentConfig.dataPath =
            'https://raw.githubusercontent.com/PubCaseFinder/pubcasefinder_tools/feature/test-web-components/smart_box/demo/tsv/nando_sample.tsv';
          break;
        case 'OMIM/Orphanet':
          this.currentConfig.dataPath =
            'https://raw.githubusercontent.com/PubCaseFinder/pubcasefinder_tools/feature/test-web-components/smart_box/demo/tsv/mondo_sample.tsv';
          break;
        case 'ICD-10':
          this.currentConfig.dataPath =
            'https://raw.githubusercontent.com/PubCaseFinder/pubcasefinder_tools/feature/test-web-components/smart_box/demo/tsv/icd10_sample.tsv';
          break;
        default:
          this.currentConfig.dataPath = '';
      }

      // アップロードエリアをリセット
      this.resetUploadArea();
    }

    this.updateSmartBox();
  }

  handleFileUpload(file) {
    if (file.name.endsWith('.tsv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // サンプルの選択を解除
        document.querySelectorAll('.data-source-option').forEach((opt) => {
          opt.classList.remove('active');
        });
        this.currentConfig.dataSource = '';
        this.currentConfig.fileName = file.name;

        // ファイルの内容をBlobとして保存し、URLを生成
        const blob = new Blob([e.target.result], {
          type: 'text/tab-separated-values',
        });
        const url = URL.createObjectURL(blob);
        this.currentConfig.dataPath = url;

        // アップロードエリアにファイル名を表示
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = `
          <i class="fa-solid fa-file-lines"></i>
          <p>Loaded: ${file.name}</p>
        `;
        uploadArea.style.borderColor = '#635ccd';

        this.updateSmartBox();
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a TSV file');
      // エラー時にアップロードエリアをリセット
      this.resetUploadArea();
    }
  }

  copyCodeToClipboard() {
    const codeElement = document.querySelector('.code-section code');
    navigator.clipboard.writeText(codeElement.textContent).then(() => {
      const copyButton = document.querySelector('.copy-button');
      copyButton.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        copyButton.innerHTML =
          '<i class="fa-regular fa-clipboard"></i> Copy to clipboard';
      }, 2000);
    });
  }

  watchConfigChanges() {
    // テキスト入力フィールドの監視
    document.querySelectorAll('input[type="text"]').forEach((input) => {
      input.addEventListener('input', () => {
        this.updateConfigFromInputs();
      });
    });

    // 数値入力フィールドの監視を追加
    document.querySelectorAll('input[type="number"]').forEach((input) => {
      input.addEventListener('input', () => {
        this.updateConfigFromInputs();
      });
    });

    // トグルスイッチの変更を監視
    document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        this.updateConfigFromInputs();
      });
    });
  }

  updateConfigFromInputs() {
    // Smart Box ID
    const smartBoxIdInput = document.querySelector(
      'input[placeholder="SampleID"]'
    );
    if (smartBoxIdInput) {
      this.currentConfig.smartBoxId = smartBoxIdInput.value;
    }

    // API URL
    const apiUrlInput = document.querySelector(
      'input[placeholder="https://example.com/moshikashite-api?text="]'
    );
    if (apiUrlInput) {
      this.currentConfig.apiUrl = apiUrlInput.value;
    }

    // Maximum Results
    const maxResultsInput = document.querySelector(
      'input[placeholder="Unlimited"]'
    );
    if (maxResultsInput) {
      // 数値として処理
      const value = maxResultsInput.value;
      if (value === '') {
        this.currentConfig.maxResults = ''; // 空の場合はUnlimited
      } else {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
          this.currentConfig.maxResults = numValue;
        } else {
          maxResultsInput.value = ''; // 不正な値の場合はクリア
          this.currentConfig.maxResults = '';
        }
      }
    }

    // Placeholder
    const placeholderInput = document.querySelector(
      'input[placeholder="Search..."]'
    );
    if (placeholderInput) {
      this.currentConfig.placeholder = placeholderInput.value;
    }

    // Include keyword toggle
    const includeKeywordToggle = document.querySelector('#includeKeyword');
    if (includeKeywordToggle) {
      this.currentConfig.includeKeyword = includeKeywordToggle.checked;
    }

    this.updateSmartBox();
  }

  updateSmartBox() {
    const smartBoxContainer = document.querySelector(
      '.demo-section:has(.fa-magnifying-glass)'
    );
    if (!smartBoxContainer) return;

    // Smart Box IDが入力されていない場合はエラーメッセージを表示
    if (!this.currentConfig.smartBoxId) {
      smartBoxContainer.innerHTML = `
        <h2 class="section-title">
          <i class="fa-solid fa-magnifying-glass"></i>Smart Box
        </h2>
        <div class="placeholder-message error">
          Please enter Smart Box ID
        </div>
      `;
      this.updateCodeSection();
      return;
    }

    const options = {
      api_url: this.currentConfig.apiUrl || undefined,
      include_no_match: this.currentConfig.includeKeyword || false,
      max_results: this.currentConfig.maxResults
        ? parseInt(this.currentConfig.maxResults)
        : undefined,
    };

    // データソースが選択されていない場合はプレースホルダーを表示
    if (!this.currentConfig.dataPath) {
      smartBoxContainer.innerHTML = `
        <h2 class="section-title">
          <i class="fa-solid fa-magnifying-glass"></i>Smart Box
        </h2>
        <div class="placeholder-message error">
          Please select a data source or upload a TSV file
        </div>
      `;
      this.updateCodeSection();
      return;
    }

    smartBoxContainer.innerHTML = `
      <h2 class="section-title">
        <i class="fa-solid fa-magnifying-glass"></i>Smart Box
      </h2>
      <smart-box 
        smart-box-id="${this.currentConfig.smartBoxId || 'demo'}"
        data-path="${this.currentConfig.dataPath}"
        placeholder="${this.currentConfig.placeholder || 'Search...'}"
        options='${JSON.stringify(options)}'
      ></smart-box>
    `;

    this.updateCodeSection();
  }

  updateCodeSection() {
    const codeSection = document.querySelector('.code-section');
    const codeContent = this.generateCode();

    // プレースホルダーメッセージとコードで異なるHTMLを生成
    codeSection.innerHTML = `
      <button class="copy-button">
        <i class="fa-regular fa-clipboard"></i> Copy to clipboard
      </button>
      <pre><code>${codeContent}</code></pre>
    `;

    // コピーボタンのイベントリスナーを再設定
    codeSection.querySelector('.copy-button').addEventListener('click', () => {
      this.copyCodeToClipboard();
    });
  }

  generateCode() {
    // Smart Box IDが入力されていない場合はエラーメッセージを表示
    if (!this.currentConfig.smartBoxId) {
      return 'Please enter Smart Box ID';
    }

    // データソースが選択されていない場合はプレースホルダーを表示
    if (!this.currentConfig.dataPath) {
      return 'Please select a data source or upload a TSV file';
    }

    const options = {
      api_url: this.currentConfig.apiUrl || undefined,
      include_no_match: this.currentConfig.includeKeyword || false,
      max_results: this.currentConfig.maxResults
        ? parseInt(this.currentConfig.maxResults)
        : undefined,
    };

    // データパスの表示を調整
    let displayPath = this.currentConfig.dataPath;
    if (this.currentConfig.fileName) {
      // アップロードされたファイルの場合はファイル名を表示
      displayPath = this.currentConfig.fileName;
    } else if (this.currentConfig.dataSource) {
      // サンプルデータの場合はそのままのパスを使用
      displayPath = this.currentConfig.dataPath;
    }

    return `&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/PubCaseFinder/pubcasefinder_tools@feature/test-web-components/smart_box/style.css"&gt;

&lt;smart-box 
  smart-box-id="${this.currentConfig.smartBoxId || 'demo'}"
  data-path="${displayPath}"
  placeholder="${this.currentConfig.placeholder || 'Search...'}"
  options='${JSON.stringify(options)}'
&gt;&lt;/smart-box&gt;

&lt;script type="module" src="https://cdn.jsdelivr.net/gh/PubCaseFinder/pubcasefinder_tools@feature/test-web-components/smart_box/smart_box.js"&gt;&lt;/script&gt;

&lt;script type="module"&gt;
  document.addEventListener('selectedSmartBoxLabel', e => console.log(e.detail.smartBoxId, e.detail.labelInfo));
&lt;/script&gt;`;
  }

  // アップロードエリアをリセットするヘルパーメソッド
  resetUploadArea() {
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.innerHTML = `
      <i class="fa-solid fa-arrow-up-from-bracket"></i>
      <p>Click to upload or drag and drop<br>TSV file only</p>
    `;
    uploadArea.style.borderColor = '#ccc';
  }
}

// デモページの初期化
document.addEventListener('DOMContentLoaded', () => {
  new SmartBoxDemo();
});

// Smart Boxのイベントリスナー
document.addEventListener('selectedSmartBoxLabel', function (event) {
  const smartBoxId = event.detail.smartBoxId;
  const labelInfo = event.detail.labelInfo;
  console.log('Selected:', { smartBoxId, labelInfo });
});
