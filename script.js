// シンプルなスクロール式謎解きゲーム
class SimpleScrollGame {
    constructor() {
        this.currentImageIndex = 0;
        this.totalImages = 14; // 日、説明２、1-9、盗塁王、情報、last
        this.correctAnswer = "なゆた|ナユタ|那由多|せいとうはなゆた|正答は那由多";  // 答え
        this.secondCorrectAnswer = "さんごくじだい|三国時代|CLEAR|clear|クリアー"; // 最終問題の答え
        this.gameStarted = false;
        this.firstAnswerCorrect = false;
        this.overlay1TapCount = 0; // overlay1のタップ回数
        this.overlay2TapCount = 0; // overlay2のタップ回数
        this.lastTapTime = 0; // 最後のタップ時間
        this.lastTapTime2 = 0; // overlay2の最後のタップ時間
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupScrollObserver();
    }
    
    bindEvents() {
        // ゲームスタート（元のボタン）
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        
        // オーバーレイ1（説明２.jpgの上のボタン）
        document.getElementById('overlay1').addEventListener('click', () => this.handleOverlay1Click());
        
        // オーバーレイ２（7.jpgの上のボタン）
        document.getElementById('overlay2').addEventListener('click', () => this.handleOverlay2Click());
        
        // 回答送信
        document.getElementById('submitBtn').addEventListener('click', () => this.submitAnswer());
        
        // 最終回答送信
        document.getElementById('submitSecondBtn').addEventListener('click', () => this.submitSecondAnswer());
        
        
        // エンターキーで回答
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // エンターキーで最終回答
        document.getElementById('secondAnswerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitSecondAnswer();
            }
        });
    }
    
    setupScrollObserver() {
        // 画像の表示を監視するIntersection Observer
        const observerOptions = {
            threshold: 0.5, // 画像の50%が見えたら表示
            rootMargin: '0px 0px -100px 0px'
        };
        
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // 最後の画像（さんごくじだい.jpg）が表示されたら最終回答エリアを表示
                    if (entry.target.dataset.image === 'さんごくじだい.jpg') {
                        setTimeout(() => {
                            this.showSecondAnswerSection();
                        }, 1000);
                    }
                }
            });
        }, observerOptions);
        
        // イントロ画像とゲーム画像の両方にオブザーバーを適用
        document.querySelectorAll('.image-item, .intro-image-item').forEach(item => {
            this.imageObserver.observe(item);
        });
    }
    
    startGame() {
        this.gameStarted = true;
        
        // 画像セクションと回答エリアを表示（イントロは非表示にしない）
        document.getElementById('imageSection').classList.remove('hidden');
        document.getElementById('answerSection').classList.remove('hidden');
        
        // 追加画像セクションを非表示にする
        document.getElementById('additionalImageSection').classList.add('hidden');
        
        // 画像セクションにスクロール
        document.getElementById('imageSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        
        // 画像エラーハンドリング
        this.handleImageErrors();
    }
    
    handleImageErrors() {
        // 画像が読み込めない場合のプレースホルダー
        document.querySelectorAll('img').forEach(img => {
            img.onerror = () => {
                const svgData = this.createPlaceholderSVG(img.alt);
                img.src = svgData;
            };
        });
    }
    
    createPlaceholderSVG(text) {
        const svg = `
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" fill="#F3F4F6"/>
                <text x="200" y="200" font-family="Arial, sans-serif" font-size="32" fill="#666" text-anchor="middle">${text}</text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
    
    showAnswerSection() {
        // 回答エリアにスクロール
        setTimeout(() => {
            document.getElementById('answerSection').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 500);
    }
    
    showSecondAnswerSection() {
        // 最終回答エリアを表示
        document.getElementById('secondAnswerSection').classList.remove('hidden');
        
    }
    
    
    submitAnswer() {
        const userAnswer = document.getElementById('answerInput').value.trim();
        
        if (!userAnswer) {
            // 空欄の場合は何も表示せず、再入力可能にする
            return;
        }
        
        const isCorrect = this.checkAnswer(userAnswer);
        
        if (isCorrect) {
            this.firstAnswerCorrect = true;
            
            // 追加画像セクションを表示
            document.getElementById('additionalImageSection').classList.remove('hidden');
            
            // 追加画像セクションにスクロール
            setTimeout(() => {
                document.getElementById('additionalImageSection').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 1000);
        } else {
            // 不正解の場合はメッセージを表示
            this.showIncorrectMessage();
        }
    }
    
    submitSecondAnswer() {
        const userAnswer = document.getElementById('secondAnswerInput').value.trim();
        
        if (!userAnswer) {
            // 空欄の場合は何も表示せず、再入力可能にする
            return;
        }
        
        // 結果を表示
        this.showResult(userAnswer);
    }
    
    showResult(userAnswer) {
        const isCorrect = this.checkSecondAnswer(userAnswer);
        
        if (isCorrect) {
            // 正解時のみ結果エリアを表示
            document.getElementById('secondAnswerSection').classList.add('hidden');
            document.getElementById('resultSection').classList.remove('hidden');
            
            // 結果を表示
            document.getElementById('userAnswer').textContent = userAnswer;
            document.getElementById('correctAnswer').textContent = this.secondCorrectAnswer;
            
            this.showMessage('おめでとうございます！正解です！', 'success');
            
            // 正解時のみ結果エリアにスクロール
            setTimeout(() => {
                document.getElementById('resultSection').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 500);
        } else {
            // 不正解の場合はメッセージを表示
            this.showIncorrectMessage();
        }
    }
    
    checkAnswer(userAnswer) {
        // 答えのチェック（表記ゆれ対応）
        const normalizedUserAnswer = userAnswer.toLowerCase().replace(/\s+/g, '');
        const possibleAnswers = this.correctAnswer.split('|');
        
        return possibleAnswers.some(answer => {
            const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, '');
            return normalizedUserAnswer === normalizedAnswer;
        });
    }
    
    checkSecondAnswer(userAnswer) {
        // 最終答えのチェック（表記ゆれ対応）
        const normalizedUserAnswer = userAnswer.toLowerCase().replace(/\s+/g, '');
        const possibleAnswers = this.secondCorrectAnswer.split('|');
        
        return possibleAnswers.some(answer => {
            const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, '');
            return normalizedUserAnswer === normalizedAnswer;
        });
    }
    
    
    showIncorrectMessage() {
        // 既存の不正解メッセージを削除
        const existingMessage = document.querySelector('.incorrect-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 不正解メッセージを作成
        const messageDiv = document.createElement('div');
        messageDiv.className = 'incorrect-message';
        messageDiv.textContent = '不正解です。もう一度考えてください。';
        
        // テキストボックスの直後に挿入（第1問または最終問題）
        const answerInput = document.getElementById('answerInput');
        const secondAnswerInput = document.getElementById('secondAnswerInput');
        const secondAnswerSection = document.getElementById('secondAnswerSection');
        
        if (secondAnswerSection && !secondAnswerSection.classList.contains('hidden')) {
            // 最終問題が表示されている場合は最終回答のテキストボックスの直後に挿入
            secondAnswerInput.parentNode.insertBefore(messageDiv, secondAnswerInput.nextSibling);
        } else {
            // 第1問の場合は第1回答のテキストボックスの直後に挿入
            answerInput.parentNode.insertBefore(messageDiv, answerInput.nextSibling);
        }
        
        // 5秒後にメッセージを削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 新しいメッセージを作成
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // 3秒後にメッセージを削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
    
    handleOverlay1Click() {
        const currentTime = Date.now();
        
        // 1秒以内の連続タップかチェック
        if (currentTime - this.lastTapTime > 1000) {
            this.overlay1TapCount = 0; // リセット
        }
        
        this.overlay1TapCount++;
        this.lastTapTime = currentTime;
        
        // 9回連続タップでモーダル表示
        if (this.overlay1TapCount >= 9) {
            this.showModalImage();
            this.overlay1TapCount = 0; // リセット
        }
    }
    
    showModalImage() {
        // モーダルオーバーレイを作成
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // モーダル画像を作成
        const modalImage = document.createElement('img');
        modalImage.src = '朝日.jpg';
        modalImage.alt = '朝日';
        modalImage.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        modalOverlay.appendChild(modalImage);
        document.body.appendChild(modalOverlay);
        
        // クリックで閉じる
        modalOverlay.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        // ESCキーで閉じる
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modalOverlay);
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }
    
    handleOverlay2Click() {
        const currentTime = Date.now();
        
        // 1秒以内の連続タップかチェック
        if (currentTime - this.lastTapTime2 > 1000) {
            this.overlay2TapCount = 0; // リセット
        }
        
        this.overlay2TapCount++;
        this.lastTapTime2 = currentTime;
        
        // 9回連続タップでモーダル表示
        if (this.overlay2TapCount >= 9) {
            this.showModalImage2();
            this.overlay2TapCount = 0; // リセット
        }
    }
    
    showModalImage2() {
        // モーダルオーバーレイを作成
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // モーダル画像を作成
        const modalImage = document.createElement('img');
        modalImage.src = '旭.jpg';
        modalImage.alt = '旭';
        modalImage.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        modalOverlay.appendChild(modalImage);
        document.body.appendChild(modalOverlay);
        
        // クリックで閉じる
        modalOverlay.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        // ESCキーで閉じる
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modalOverlay);
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }
}

// ゲームの初期化
document.addEventListener('DOMContentLoaded', () => {
    new SimpleScrollGame();
});