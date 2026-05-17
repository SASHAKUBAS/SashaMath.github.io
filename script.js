let currentInput = '0';
let fullEquation = '';
let userMathPlan = 'free'; 
let hasEyeCare = false;    
let isDarkTheme = false;
let justCalculated = false;
let hasError = false;

let authAttempts = 0; 
let requireAd = true;      
let requireQueue = true;   
let requireCaptcha = true; 
let captchaAttempts = 0;

const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const cashSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
const errorSound = new Audio('https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3');

const currentDisplay = document.getElementById('current');
const equationDisplay = document.getElementById('equation');
const aiStatus = document.getElementById('ai-status');
const paywallOverlay = document.getElementById('paywall-overlay');
const paywallCards = document.getElementById('paywall-cards');
const processingModal = document.getElementById('processing-modal');
const processText = document.getElementById('process-text');
const planIndicator = document.getElementById('plan-indicator');
const themeIcon = document.getElementById('theme-icon');

const authOverlay = document.getElementById('auth-overlay');
const authErrorBox = document.getElementById('auth-error');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');

const queueOverlay = document.getElementById('queue-overlay');
const queueCountText = document.getElementById('queue-count');

const captchaOverlay = document.getElementById('captcha-overlay');
const captchaGrid = document.getElementById('captcha-grid');
const captchaError = document.getElementById('captcha-error');

const adOverlay = document.getElementById('ad-overlay');
const skipAdBtn = document.getElementById('skip-ad-btn');
const adContentBox = document.getElementById('ad-content');

const aiMessages = [
    "Підключення до Квантової Хмари...",
    "Оптимізація математичного шляху...",
    "Синхронізація з Ілоном...",
    "Застосування AI-фільтрів..."
];

// Масив реальних банерів із посиланнями на сайти
const realAds = [
    { 
        image: "images.jpg", 
        link: "https://surl.li/myskqz" 
    },
    { 
        image: "uklon_car_ua-2048x1158-1.png", 
        link: "https://uklon.com.ua/online-order/" 
    },
    

];

function processAuth() {
    if (!authEmail.value || !authPassword.value) {
        authErrorBox.innerText = "Заповніть усі поля для доступу до нейромережі.";
        authErrorBox.style.display = "block";
        errorSound.play();
        return;
    }
    authAttempts++;
    if (authAttempts === 1) {
        errorSound.play();
        authErrorBox.innerText = "Цей пароль вже використовує користувач mazurenok.oleksandr@gmail.com, введіть інший.";
        authErrorBox.style.display = "block";
        authPassword.value = ''; 
    } else {
        clickSound.play();
        authOverlay.classList.remove('active');
        document.querySelector('.logo').innerText = `MathPro | ${authEmail.value.split('@')[0]}`;
    }
}

function showAd() {
    const randomAd = realAds[Math.floor(Math.random() * realAds.length)];
    
    adContentBox.innerHTML = `
        <a href="${randomAd.link}" target="_blank" style="display: block; overflow: hidden; border-radius: 8px;">
            <img src="${randomAd.image}" alt="Реклама" style="width: 100%; height: auto; display: block; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        </a>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Натисніть на банер, щоб дізнатися більше</p>
    `;

    adContentBox.style.padding = "0";
    adContentBox.style.border = "none";

    adOverlay.classList.add('active');
    
    skipAdBtn.disabled = true;
    skipAdBtn.style.opacity = '0.5';
    skipAdBtn.style.cursor = 'not-allowed';
    
    let timeLeft = 5;
    skipAdBtn.innerText = `Пропустити (${timeLeft})`;

    let adInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            skipAdBtn.innerText = `Пропустити (${timeLeft})`;
        } else {
            clearInterval(adInterval);
            skipAdBtn.innerText = "Пропустити рекламу ⏭";
            skipAdBtn.disabled = false;
            skipAdBtn.style.opacity = '1';
            skipAdBtn.style.cursor = 'pointer';
        }
    }, 1000);
}

function skipAd() {
    clickSound.play();
    adOverlay.classList.remove('active');
    requireAd = false; 
    calculate(); 
}

function showQueue() {
    queueOverlay.classList.add('active');
    let count = 14592;
    queueCountText.innerText = count.toLocaleString('uk-UA');
    
    let queueTimer = setInterval(() => {
        if (count > 5000) count -= Math.floor(Math.random() * 3000) + 1000;
        else if (count > 1000) count -= Math.floor(Math.random() * 1000) + 500;
        else if (count > 100) count -= Math.floor(Math.random() * 300) + 100;
        else if (count > 10) count -= Math.floor(Math.random() * 20) + 10;
        else if (count > 1) count = 1; 
        else count = 0;

        if (count <= 0) {
            count = 0;
            clearInterval(queueTimer);
            queueCountText.innerText = count;
            setTimeout(() => {
                queueOverlay.classList.remove('active');
                requireQueue = false; 
                calculate(); 
            }, 600);
        } else {
            queueCountText.innerText = count.toLocaleString('uk-UA');
        }
    }, 700);
}

function openPaywallFromQueue() {
    queueOverlay.classList.remove('active');
    paywallOverlay.classList.add('active');
}

function showCaptcha() {
    const emojis = ['🚦', '🚗', '🚌', '🚲', '🚦', '🏢', '🌳', '🚦', '🚶‍♂️'];
    emojis.sort(() => Math.random() - 0.5); 
    
    captchaGrid.innerHTML = '';
    emojis.forEach(e => {
        const div = document.createElement('div');
        div.className = 'captcha-item';
        div.innerText = e;
        div.onclick = () => div.classList.toggle('selected');
        captchaGrid.appendChild(div);
    });
    
    captchaError.style.display = 'none';
    captchaAttempts = 0;
    captchaOverlay.classList.add('active');
}

function verifyCaptcha() {
    captchaAttempts++;
    if (captchaAttempts === 1) {
        errorSound.play();
        captchaError.innerText = "Ви пропустили один піксель світлофора. ШІ сумнівається у вас. Спробуйте ще раз.";
        captchaError.style.display = "block";
        document.querySelectorAll('.captcha-item').forEach(el => el.classList.remove('selected'));
    } else {
        clickSound.play();
        captchaOverlay.classList.remove('active');
        requireCaptcha = false; 
        calculate(); 
    }
}

function checkDailyLimit() {
    if (userMathPlan !== 'free') return true;
    const today = new Date().toDateString();
    const storage = JSON.parse(localStorage.getItem('math_usage') || '{"date": "", "count": 0}');
    if (storage.date !== today) {
        localStorage.setItem('math_usage', JSON.stringify({ date: today, count: 0 }));
        return true;
    }
    return storage.count < 2;
}

function incrementUsage() {
    if (userMathPlan !== 'free') return;
    const storage = JSON.parse(localStorage.getItem('math_usage'));
    storage.count++;
    localStorage.setItem('math_usage', JSON.stringify(storage));
}

function updatePlanIndicator() {
    let planName = "Базовий";
    if (userMathPlan === 'student') planName = "Студент";
    if (userMathPlan === 'pro') planName = "Pro Ultra";
    if (userMathPlan === 'mega-pro') planName = "Mega Pro";
    
    let extra = hasEyeCare ? " + EyeCare 👁️" : "";
    planIndicator.innerHTML = `<div class="dot"></div> Поточний тариф: ${planName}${extra}`;
    
    if (userMathPlan !== 'free' || hasEyeCare) {
        planIndicator.classList.add('pro-active');
    }
}

function toggleTheme() {
    if (hasEyeCare || userMathPlan === 'mega-pro') {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme', isDarkTheme);
        themeIcon.innerText = isDarkTheme ? '☀️' : '🌙';
        clickSound.play();
    } else {
        errorSound.play();
        aiStatus.innerText = "Dark Mode — тільки для EyeCare Pro";
        aiStatus.style.opacity = "1";
        setTimeout(() => paywallOverlay.classList.add('active'), 500);
    }
}

function updateDisplay() {
    const displayText = currentInput.replace(/\*/g, '×').replace(/\//g, '÷');
    currentDisplay.innerText = displayText;
    equationDisplay.innerText = fullEquation.replace(/\*/g, '×').replace(/\//g, '÷');
}

function appendInput(val) {
    clickSound.currentTime = 0; clickSound.play();
    if (hasError) { currentInput = '0'; fullEquation = ''; hasError = false; justCalculated = false; resetDisplayStyle(); }
    if (justCalculated) {
        if (['+', '-', '*', '/'].includes(val)) justCalculated = false;
        else { currentInput = '0'; fullEquation = ''; justCalculated = false; }
    }
    if (currentInput === '0' && val !== '.') currentInput = val;
    else currentInput += val;
    updateDisplay();
}

function resetDisplayStyle() {
    currentDisplay.style.fontSize = "2.5rem";
    currentDisplay.style.color = "var(--text-main)";
}

function clearAll() {
    currentInput = '0'; fullEquation = ''; justCalculated = false;
    hasError = false; aiStatus.style.opacity = '0';
    resetDisplayStyle(); updateDisplay();
}

function calculate() {
    if (!currentInput || (currentInput === '0' && fullEquation === '')) return;

    if (userMathPlan === 'mega-pro') {
        currentInput = "Hello World";
        fullEquation = "Ультимативна відповідь";
        aiStatus.innerText = "Mega Pro Аналіз Завершено";
        aiStatus.style.opacity = '1';
        justCalculated = true;
        hasError = false;
        updateDisplay();
        setTimeout(() => aiStatus.style.opacity = '0', 2000);
        return; 
    }

    if (requireAd && userMathPlan !== 'pro' && userMathPlan !== 'mega-pro') {
        showAd();
        return;
    }

    if (requireQueue && userMathPlan !== 'pro') {
        showQueue();
        return;
    }

    if (requireCaptcha && userMathPlan !== 'pro') {
        showCaptcha();
        return;
    }

    const sanitized = currentInput.replace(/[+\-*/]$/, '').trim();
    let depth = 0;
    let expression = sanitized;
    for (const ch of expression) { if (ch === '(') depth++; if (ch === ')') depth--; }
    if (depth > 0) expression += ')'.repeat(depth);
    currentInput = expression;
    updateDisplay(); 

    if (!checkDailyLimit()) {
        errorSound.play();
        currentDisplay.innerText = "Ліміт вичерпано (2/2)";
        currentDisplay.style.fontSize = "1.2rem";
        currentDisplay.style.color = "var(--danger)";
        setTimeout(() => {
            const freeCard = document.getElementById('card-free');
            freeCard.innerHTML = `<h3>Ліміт вичерпано</h3><p style="font-size:0.8rem; margin:10px 0; color:var(--text-muted);">Ваш трафік закінчився, купіть крутішу версію або чекайте 24 години</p>`;
            paywallOverlay.classList.add('active');
        }, 1000);
        
        requireAd = true; 
        requireQueue = true; 
        requireCaptcha = true;
        return;
    }

    const hasAdvancedMath = /sqrt|sin|cos/.test(currentInput);
    const hasProMath = /[*\/]/.test(currentInput);
    let canCalculate = false;
    let errorText = "";

    if (userMathPlan === 'pro') {
        canCalculate = true;
    } else if (userMathPlan === 'student') {
        if (!hasAdvancedMath) canCalculate = true;
        else errorText = "Наукові функції — тільки в Pro Ultra";
    } else {
        if (!hasAdvancedMath && !hasProMath) canCalculate = true;
        else errorText = "Множення та функції — Premium опції";
    }

    aiStatus.innerText = aiMessages[Math.floor(Math.random() * aiMessages.length)];
    aiStatus.style.opacity = '1';

    if (canCalculate) {
        setTimeout(() => {
            let hallucination = (userMathPlan === 'free' && Math.random() < 0.05);
            executeMath(hallucination);
            incrementUsage();
            
            requireAd = true;
            requireQueue = true; 
            requireCaptcha = true; 
        }, 1000);
    } else {
        setTimeout(() => {
            errorSound.play();
            currentDisplay.innerText = errorText;
            currentDisplay.style.fontSize = "1.1rem";
            currentDisplay.style.color = "var(--danger)";
            setTimeout(() => paywallOverlay.classList.add('active'), 800);
            
            requireAd = true;
            requireQueue = true; 
            requireCaptcha = true;
        }, 1500);
    }
}

function executeMath(isHallucination = false) {
    try {
        let expression = currentInput.replace(/sqrt\(/g, 'Math.sqrt(').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(');
        let result = Function('"use strict"; return (' + expression + ')')();
        
        if (isHallucination) {
            result += (Math.floor(Math.random() * 10) + 1);
            aiStatus.innerText = "ШІ трохи втомився, але вирішив!";
        } else {
            aiStatus.innerText = "Обчислено ідеально";
        }

        fullEquation = currentInput;
        currentInput = (result % 1 !== 0 ? result.toFixed(4) : result).toString();
        justCalculated = true;
    } catch (e) {
        currentInput = "Помилка обчислень";
        hasError = true;
    }
    updateDisplay();
    setTimeout(() => aiStatus.style.opacity = '0', 2000);
}

function processPayment(plan) {
    paywallCards.style.display = 'none';
    processingModal.style.display = 'flex';
    let step = 0;
    const steps = ["Зв'язок з банком...", "Перевірка балансу...", "Активація потужності..."];

    const timer = setInterval(() => {
        if (step < steps.length) processText.innerText = steps[step++];
        else {
            clearInterval(timer);
            cashSound.play();
            
            if (plan === 'EyeCare Pro') {
                hasEyeCare = true;
            } else {
                userMathPlan = plan.toLowerCase().replace(/\s+/g, '-');
                if (userMathPlan === 'mega-pro') hasEyeCare = true; 
            }

            updatePlanIndicator();
            
            setTimeout(() => {
                paywallOverlay.classList.remove('active');
                paywallCards.style.display = 'flex';
                processingModal.style.display = 'none';
                clearAll();
                
                if (hasEyeCare && !isDarkTheme) {
                    toggleTheme();
                }
            }, 1000);
        }
    }, 1200);
}

function closePaywall() {
    paywallOverlay.classList.remove('active');
}
