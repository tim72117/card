const colors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
];

const itemPool = [
    { name: '幸運符', icon: '🍀', price: 500 },
    { name: '魔法藥水', icon: '🧪', price: 800 },
    { name: '時間沙漏', icon: '⏳', price: 1000 },
    { name: '神秘寶石', icon: '💎', price: 2000 },
    { name: '傳奇護盾', icon: '🛡️', price: 5000 },
    { name: '超級星星', icon: '⭐', price: 10000 },
    { name: '閃電卷軸', icon: '⚡', price: 1500 },
    { name: '勇者之劍', icon: '🗡️', price: 3000 },
    { name: '古老地圖', icon: '📜', price: 1200 },
    { name: '神祕箱子', icon: '📦', price: 4500 },
    { name: '紅蘋果', icon: '🍎', price: 300 },
    { name: '龍之鱗片', icon: '🐉', price: 8000 },
    { name: '隱身斗篷', icon: '🧥', price: 6000 },
    { name: '幸運之戒', icon: '💍', price: 2500 },
    { name: '指路明燈', icon: '🕯️', price: 700 }
];

const itemPrices = itemPool.reduce((acc, item) => {
    acc[item.name] = item.price;
    return acc;
}, {});

let currentShopItems = itemPool.slice(0, 6); // 初始 6 個商品

let gameCards = [...colors, ...colors];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let money = localStorage.getItem('gameMoney') !== null ? parseInt(localStorage.getItem('gameMoney')) : 20000;
let inventory = JSON.parse(localStorage.getItem('gameInventory')) || [];
let isLockBoard = false;

// 確保金幣初始值正確並存檔
if (money < 20000) {
    money = 20000;
}
localStorage.setItem('gameMoney', money);

console.log('遊戲啟動:', { money, inventoryLength: inventory.length });

const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const moneyDisplay = document.getElementById('money');
const resetBtn = document.getElementById('reset-btn');

// 出售彈窗相關
const sellConfirmModal = document.getElementById('sell-confirm-modal');
const sellItemIcon = document.getElementById('sell-item-icon');
const sellItemName = document.getElementById('sell-item-name');
const sellBasePriceDisp = document.getElementById('sell-base-price');
const sellPriceInput = document.getElementById('sell-price-input');
const confirmSellBtn = document.getElementById('confirm-sell-btn');
const cancelSellBtn = document.getElementById('cancel-sell-btn');

let currentSellItem = null;
let currentSellIndex = -1;
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
    const totalSlots = 15; // 5x3 網格
    const fragment = document.createDocumentFragment();
    
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
                <button class="sell-btn" data-index="${i}">出售</button>
            `;
            slot.appendChild(itemDiv);
            
            // 綁定出售事件
            itemDiv.querySelector('.sell-btn').addEventListener('click', () => {
                sellItem(item, i);
            });
        }
        
        fragment.appendChild(slot);
    }
    
    inventoryList.innerHTML = '';
    inventoryList.appendChild(fragment);
}

function renderShop() {
    const shopList = document.querySelector('.item-list');
    shopList.innerHTML = '';
    
    currentShopItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('shop-item');
        itemDiv.dataset.index = index;
        itemDiv.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.price} 金幣</div>
            <button class="buy-btn">購買</button>
        `;
        shopList.appendChild(itemDiv);
    });
}

function replaceShopItem(index) {
    // 從商品池隨機選一個「不在架上」的商品
    const availablePool = itemPool.filter(item => 
        !currentShopItems.some(shopItem => shopItem.name === item.name)
    );
    
    if (availablePool.length > 0) {
        const newItem = availablePool[Math.floor(Math.random() * availablePool.length)];
        currentShopItems[index] = newItem;
        renderShop();
    }
}

function sellItem(item, index) {
    currentSellItem = item;
    currentSellIndex = index;
    
    const itemName = item.name.trim();
    const basePrice = itemPrices[itemName] || 500;
    
    // 填充彈窗資訊
    sellItemIcon.textContent = item.icon;
    sellItemName.textContent = itemName;
    sellBasePriceDisp.textContent = basePrice;
    sellPriceInput.value = basePrice;
    
    // 顯示彈窗
    sellConfirmModal.classList.add('show');
}

confirmSellBtn.addEventListener('click', () => {
    if (!currentSellItem) return;
    
    const basePrice = itemPrices[currentSellItem.name.trim()] || 500;
    const price = parseInt(sellPriceInput.value);
    
    if (isNaN(price) || price <= 0) {
        alert('請輸入有效的金額！');
        return;
    }

    // 隨機判定邏輯
    let successRate = 1.0;
    const ratio = price / basePrice;
    
    if (ratio > 1) {
        successRate = Math.max(0.05, 1.0 - (ratio - 1) * 0.8);
    }
    
    const random = Math.random();
    console.log(`[出售偵錯] 商品: ${currentSellItem.name}, 定價: ${price}, 成功率: ${(successRate * 100).toFixed(0)}%`);

    if (random <= successRate) {
        money += price;
        inventory.splice(currentSellIndex, 1);
        saveMoney();
        saveInventory();
        
        moneyDisplay.textContent = money;
        alert(`🎉 機器人接受了這個價格！成功賣出 ${price} 金幣。`);
        updateInventoryUI();
    } else {
        alert('❌ 機器人搖了搖頭，覺得這個價格太貴了，不想買。');
    }
    
    closeSellModal();
});

cancelSellBtn.addEventListener('click', closeSellModal);

function closeSellModal() {
    sellConfirmModal.classList.remove('show');
    currentSellItem = null;
    currentSellIndex = -1;
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
    renderShop();
    shopModal.classList.add('show');
});

backToGameBtn.addEventListener('click', () => {
    shopModal.classList.remove('show');
});

// 使用事件委派處理購買按鈕
document.querySelector('.item-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('buy-btn')) {
        const itemDiv = e.target.closest('.shop-item');
        const shopIndex = parseInt(itemDiv.dataset.index);
        const item = currentShopItems[shopIndex];

        if (money >= item.price) {
            money -= item.price;
            saveMoney();
            moneyDisplay.textContent = money;
            shopCurrentMoney.textContent = money;
            
            // 加入背包
            inventory.push({ name: item.name.trim(), icon: item.icon.trim() });
            saveInventory();
            
            alert(`成功購買 ${item.name}！`);
            
            // 自動補貨
            replaceShopItem(shopIndex);
        } else {
            alert('金幣不足！');
        }
    }
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
    
    // 隨機更換寶箱頁面顏色
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const chestContent = document.querySelector('.chest-content');
    chestContent.style.background = `${randomColor}33`; // 20% 透明度 (33 hex)
    chestContent.style.borderColor = randomColor;
    chestContent.style.boxShadow = `0 0 30px ${randomColor}44`;
    
    updateInventoryUI();
    chestModal.classList.add('show');
});

closeChestBtn.addEventListener('click', () => {
    chestModal.classList.remove('show');
});

// Initial display of persistent money
moneyDisplay.textContent = money;
