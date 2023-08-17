const apiUrl = 'https://deckofcardsapi.com/api/deck';
let deckId;
let horsePositions = {};
let sideLineCards = [];
let currentCard;
let revealeCard = false;
const racetrack = document.querySelector('.race');
const suitCount = {
  HEARTS: 0,
  DIAMONDS: 0,
  CLUBS: 0,
  SPADES: 0,
};
let revealedSideCards = 1;

// Function to create horse cards with images and populate the racetrack
function createHorseCards() {
  const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  for (let i = 0; i < suits.length; i++) {
    const horseCard = document.createElement('div');
    horseCard.classList.add('horse-card');
    horseCard.classList.add(`grid-item${i + 1}`);
    horseCard.setAttribute('data-suit', suits[i]);
    document.querySelector('.race').appendChild(horseCard);
    horsePositions[suits[i]] = {
      card: horseCard,
      position: 0,
    };
  }
}

function createSideLineCards() {
  for (let i = 0; i < sideLineCards.length; i++) {
    const sideLineCard = document.createElement('div');
    sideLineCard.classList.add('side-line-card');
    sideLineCard.classList.add(`grid-item-${i + 1}`);
    sideLineCard.style.backgroundImage = `url(https://deckofcardsapi.com/static/img/back.png)`;
    document.querySelector('.race').appendChild(sideLineCard);
  }
}
function generateSideLineCards() {
  for (let i = 0; i < 5; i++) {
    fetch(`${apiUrl}/${deckId}/draw/?count=1`)
      .then((response) => response.json())
      .then((data) => {
        const drawnCard = data.cards[0];
        sideLineCards.push(drawnCard);
        if (sideLineCards.length === 5) {
          createSideLineCards();
          document.querySelector('.drawCardButton').disabled = false;
        }
      })
      .catch((error) => {
        console.error('Error drawing card:', error);
      });
  }
}
// Function to fetch a new deck and start the game
function startGame() {
  console.log('start game');
  console.log(racetrack);
  fetch(`${apiUrl}/new/shuffle/?deck_count=1`)
    .then((response) => response.json())
    .then((data) => {
      deckId = data.deck_id;
      isGameStarted = true;
      createHorseCards();
      generateSideLineCards();
    })
    .catch((error) => {
      console.error('Error starting game:', error);
    });
}

// Function to draw a card from the deck
function drawCard() {
  const currentCardElement = document.querySelector('.currentCard');
  fetch(`${apiUrl}/${deckId}/draw/?count=1`)
    .then((response) => response.json())
    .then((data) => {
      currentCard = data.cards[0];
      currentCardElement.textContent = `${currentCard.value} of ${currentCard.suit}`;
      moveHorse(currentCard.suit);
      document.querySelector(
        '.deck'
      ).style.backgroundImage = `url(${currentCard.image})`;
    })
    .catch((error) => {
      console.error('Error drawing card:', error);
    });
}
// Function to reveal the side cards
function revealSideCard() {
  for (const suit in suitCount) {
    if (suitCount[suit] >= revealedSideCards) {
      revealeCard = true;
    } else {
      revealeCard = false;
      break;
    }
  }
  if (revealeCard == true) {
    const sideLineCard = document.querySelector(
      `.grid-item-${6 - revealedSideCards}`
    );
    sideLineCard.style.backgroundImage = `url(${
      sideLineCards[revealedSideCards - 1].image
    })`;
    const suit = sideLineCards[revealedSideCards - 1].suit;
    const horseCard = document.querySelector(`[data-suit="${suit}"]`);
    let currentPosition = horsePositions[suit].position;
    currentPosition -= 1;
    horsePositions[suit].position = currentPosition;
    horseCard.style.transform += `translateY(${
      horsePositions[suit].position + 105
    }%)`;
    suitCount[suit]--;
    revealedSideCards++;
  }
}

// Function to move the horse based on the drawn card
function moveHorse(cardSuit) {
  const winnerElement = document.querySelector('.winner');
  const horseCard = document.querySelector(`[data-suit="${cardSuit}"]`);
  let currentPosition = horsePositions[currentCard.suit].position;
  suitCount[cardSuit]++;
  currentPosition += 1;
  horsePositions[cardSuit].position = currentPosition;
  horseCard.style.transform = `translateY(-${
    horsePositions[cardSuit].position * 105
  }%)`;
  // Check if any horse reaches the finish line
  for (const suit in suitCount) {
    if (suitCount[suit] === 6) {
      winnerElement.textContent = `${suit} wins!`;
      const horseCard = document.querySelector(`[data-suit="${suit}"]`);
        document.querySelector('.drawCardButton').removeEventListener('click', drawCard);
      displayWinnerModal(suit);
      break;
    }
  }
  revealSideCard();
}
function displayWinnerModal(suit) {
  const modalWinner = document.getElementById('modalWinner');
  modalWinner.textContent = `${suit} wins!`;

  const modal = document.getElementById('myModal');
  const startGameModalButton = document.getElementById('startGameModalButton');

  // Set focus to the "Start Game" button
  modal.style.display = 'block';
  startGameModalButton.focus();
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  const startGameModalButton = document.getElementById('startGameModalButton');

  startGameModalButton.addEventListener('click', function () {
    location.reload(); // Reload the page to start a new game
  });
  
  document.querySelector('.drawCardButton').addEventListener('click', drawCard);
  startGame();
});
