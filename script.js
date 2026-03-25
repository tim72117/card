const colors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
];

let gameCards = [...colors, ...colors];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let money = localStorage.getItem('gameMoney') !== null ? parseInt(localStorage.getItem('gameMoney')) : 3000;
let inventory = JSON.parse(localStorage.getItem('gameInventory')) || [];
let isLockBoard = false;

// Ensure initial value is saved if new
if (localStorage.getItem('gameMoney') === null) {
    localStorage.setItem('gameMoney', money);
}

console.log('遊戲啟動:', { money, inventoryLength: inventory.length });

const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const moneyDisplay = document.getElementById('money');
const resetBtn = document.getElementById('reset-btn');
const shopBtn = document.getElementById('shop-btn');
const chestBtn = document.getElementById('chest-btn');
const winModal = document.getElementById('win-modal');
const shopModal = document.getElementById('shop-modal');
const chestModal = document.getElementById('chest-modal');
const inventoryList = document.getElementById('inventory-list');
const closeChestBtn = document.getElementById('close-chest-btn');
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
    // Money is persistent now, handle display only
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
    saveMoney();
    moneyDisplay.textContent = money;
    
    flippedCards = [];

    if (matchedPairs === colors.length) {
        setTimeout(showWinModal, 500);
    }
}

function saveMoney() {
    console.log('儲存金幣:', money);
    localStorage.setItem('gameMoney', money);
}

function saveInventory() {
    console.log('儲存寶箱:', inventory);
    localStorage.setItem('gameInventory', JSON.stringify(inventory));
}

function updateInventoryUI() {
    inventoryList.innerHTML = '';
    const totalSlots = 12; // 3x4 網格
    
    for (let i = 0; i < totalSlots; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        
        if (inventory[i]) {
            slot.classList.add('occupied');
            const item = inventory[i];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item');
            itemDiv.innerHTML = `
                <span class="icon">${item.icon}</span>
                <span class="name">${item.name}</span>
            `;
            slot.appendChild(itemDiv);
        }
        
        inventoryList.appendChild(slot);
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
            saveMoney();
            moneyDisplay.textContent = money;
            shopCurrentMoney.textContent = money;
            
            // Add to inventory
            const icon = item.querySelector('.item-icon').textContent;
            inventory.push({ name: itemName, icon: icon });
            saveInventory();
            
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

// Chest Logic
chestBtn.addEventListener('click', () => {
    console.log('開啟寶箱, 現有物品:', inventory);
    updateInventoryUI();
    chestModal.classList.add('show');
});

closeChestBtn.addEventListener('click', () => {
    chestModal.classList.remove('show');
});

// Initial display of persistent money
moneyDisplay.textContent = money;
