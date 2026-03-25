const colors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
];

let gameCards = [...colors, ...colors];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let money = 0;
let isLockBoard = false;

const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const moneyDisplay = document.getElementById('money');
const resetBtn = document.getElementById('reset-btn');
const shopBtn = document.getElementById('shop-btn');
const winModal = document.getElementById('win-modal');
const shopModal = document.getElementById('shop-modal');
const shopCurrentMoney = document.getElementById('shop-current-money');
const backToGameBtn = document.getElementById('back-to-game-btn');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const finalMovesDisplay = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(color, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.color = color;
    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-face card-front"></div>
        <div class="card-face card-back" style="background-color: ${color}"></div>
    `;

    card.addEventListener('click', () => flipCard(card));
    return card;
}

function initGame() {
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isLockBoard = false;
    
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matchedPairs;
    money = 0;
    moneyDisplay.textContent = money;
    winModal.style.display = 'none';

    const shuffledCards = shuffle([...gameCards]);
    shuffledCards.forEach((color, index) => {
        const cardElement = createCard(color, index);
        gameBoard.appendChild(cardElement);
    });
}

function flipCard(card) {
    if (isLockBoard || card.classList.contains('flipped') || flippedCards.includes(card)) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.color === card2.dataset.color;

    if (isMatch) {
        handleMatch();
    } else {
        unflipCards();
    }
}

function handleMatch() {
    matchedPairs++;
    matchesDisplay.textContent = matchedPairs;
    
    // Earn money on match
    money += 100;
    moneyDisplay.textContent = money;
    
    flippedCards = [];

    if (matchedPairs === colors.length) {
        setTimeout(showWinModal, 500);
    }
}

function unflipCards() {
    isLockBoard = true;
    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        flippedCards = [];
        isLockBoard = false;
    }, 1000);
}

function showWinModal() {
    finalMovesDisplay.textContent = moves;
    winModal.style.display = 'flex';
}

resetBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);
startBtn.addEventListener('click', () => {
    startScreen.classList.remove('show');
    initGame();
});

// Shop Logic
shopBtn.addEventListener('click', () => {
    shopCurrentMoney.textContent = money;
    shopModal.classList.add('show');
});

backToGameBtn.addEventListener('click', () => {
    shopModal.classList.remove('show');
});

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const item = e.target.closest('.shop-item');
        const price = parseInt(item.dataset.price);
        const itemName = item.querySelector('.item-name').textContent;

        if (money >= price) {
            money -= price;
            moneyDisplay.textContent = money;
            shopCurrentMoney.textContent = money;
            alert(`成功購買 ${itemName}！`);
        } else {
            alert('金幣不足！');
        }
    });
});

// Initialize logic
function welcome() {
    // Just show the start screen (already show class in HTML)
    // Game will init when startBtn is clicked
}

welcome();
