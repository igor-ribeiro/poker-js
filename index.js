import {
  SUITS,
  VALUES_RANKING,
  HANDS_RANKING,
  TOTAL_CARDS,
  CARDS_PER_PLAYER,
  BOARD_STRUCTURE,
  WINNER_HAND_COUNT,
} from './config';

import { printPlayers, printBoard, printWinners } from './printers';

import { generateDeck, getPairsTripsQuads, getCardsScore } from './helpers';

import checkHoldem from './checkers/holdem';

const GAME_TYPE = 'holdem';

const MODE = '';

const PLAYERS_COUNT = 2;

const WINNER_STRUCTURE = {
  holdem: checkHoldem,
  chinese: () => null,
};

function _generateDeck(values) {
  const deck = [];

  for (let value of values) {
    for (let suit of SUITS) {
      const display = value + suit;

      const card = {
        display,
        value,
        suit,
        score: VALUES_RANKING[value],
      };

      deck.push(card);
    }
  }

  return deck;
}

function testDeck(deck) {
  const countByValue = {};

  for (let value in VALUES_RANKING) {
    if (value in countByValue === false) {
      countByValue[value] = 0;
    }

    countByValue[value] = deck.filter(c => c.value === value).length;
  }

  console.log(countByValue);
}

if (MODE !== 'test') {
  const game = generateGame();

  dealCards(game);
  printPlayers(game.players);

  dealBoard(game);
  printBoard(game.board);

  const winners = getWinners(game);
  printWinners(winners);
}

function testStraight() {
  console.log('\n------ TEST STRAIGHT');
  const testStraight = ['A', '10', 'K', 'J', 'Q', '3'].map(String);
  const testDeck = _generateDeck(testStraight);
  const testCache = new Set();

  function getUniqueCard(deck, value, found = new Set()) {
    let unique = deck.find(
      card => card.value === value && found.has(card.display) === false,
    );

    found.add(unique.display);

    return unique;
  }

  const testCards = sortCardsByValue(
    testStraight.map(value => {
      const shuffled = [...testDeck].sort(() =>
        Math.round(Math.random() * (3 - 1) - 1),
      );

      return getUniqueCard(shuffled, value, testCache);
    }),
  );

  console.log('HAND:', testCards.map(c => c.display));

  console.log(
    'FOUND:',
    checkStraight({ name: 'Igor' }, testCards).cards.map(c => c.display),
  );
}

function testFlush() {
  console.log('\n------ TEST FLUSH');
  const cards = sortCardsByValue(
    ['A♣', '2♣', 'Q♥', '5♣', 'K♦', '9♣', 'A♥', 'J♣'].map(c => getCard(c)),
  );

  console.log('HAND:', cards.map(c => c.display));

  console.log(
    'FOUND:',
    checkFlush({ name: 'Igor' }, cards).cards.map(c => c.display),
  );
}

function testStraightFlush() {
  console.log('\n------ TEST STRAIGHT FLUSH');
  const cards = sortCardsByValue(
    ['A♣', '10♣', 'Q♥', 'Q♣', 'K♦', 'J♣', 'A♥', 'K♣'].map(c => getCard(c)),
  );

  console.log('HAND:', cards.map(c => c.display));

  const found = checkStraightFlush({ name: 'Igor' }, cards);

  if (found == null) {
    console.log('NOT FOUND');
    return;
  }

  console.log('FOUND:', found.name, found.cards.map(c => c.display));
}

function testPair() {
  console.log('\n------ TEST FLUSH');
  const cards = sortCardsByValue(
    ['J♠', '6♠', '8♦', '3♠', '2♣', 'A♠', '8♥'].map(c => getCard(c)),
  );

  console.log('HAND:', cards.map(c => c.display));

  console.log(
    'FOUND:',
    checkPairs({ name: 'Igor' }, cards).cards.map(c => c.display),
  );
}

function testJT() {
  const countByPlayer = {};
  const totalHands = 50000;
  const totalPlayers = 9;

  const handToTest = ['A', 'A'];

  console.log(
    '-- SIMULATING',
    totalHands,
    'HANDS WITH',
    totalPlayers,
    'PLAYERS --',
  );

  const forcedCards = [
    // ['K♦', 'K♣'],
    // ['A♠', 'A♥'],
    ['J♦', '10♠'],
    // ['A♣', 'K♣'],
    // ['A♠', 'Q♠'],
    // ['A♥', 'J♥'],
  ];

  const jackTen = {
    received: 0,
    won: 0,
  };

  for (let hand = 1; hand <= totalHands; hand++) {
    const game = generateGame({
      playersCount: totalPlayers,
    });

    const ignoreCards = [];
    const ignorePlayers = [];

    forcedCards.forEach((cards, index) => {
      const player = game.players[index];
      player.name = cards.join('');

      player.cards.push(...cards.map(getCard));
      ignoreCards.push(...cards);
      ignorePlayers.push(player.name);
    });

    game.deck = generateDeck(TOTAL_CARDS, ignoreCards);
    game.deadCards.push(...ignoreCards);

    for (let player of game.players) {
      if (player.name in countByPlayer === false) {
        countByPlayer[player.name] = 0;
      }
    }

    dealCards(game, {
      ignorePlayers,
    });

    for (let player of game.players) {
      const cards = player.cards.filter(card =>
        handToTest.includes(card.value),
      );

      if (cards.length < 2) {
        continue;
      }

      jackTen.received++;
    }

    // printPlayers(game.players);

    dealBoard(game);

    // printBoard(game.board);

    const winners = getWinners(game);

    for (let winner of winners) {
      countByPlayer[winner.player.name]++;

      const cards = winner.player.cards.filter(card =>
        handToTest.includes(card.value),
      );

      if (cards.length < 2) {
        continue;
      }

      jackTen.won++;
    }

    // printWinners(winners);
  }

  for (let hand in countByPlayer) {
    if (hand.startsWith('Player')) {
      delete countByPlayer[hand];
      continue;
    }

    countByPlayer[hand] =
      Number((countByPlayer[hand] / totalHands) * 100).toFixed(2) + '%';
  }

  const received =
    Number((jackTen.received / totalHands) * 100).toFixed(2) + '%';
  const won = Number((jackTen.won / totalHands) * 100).toFixed(2) + '%';

  console.log(countByPlayer);
  // console.log(jackTen);
  console.log(
    handToTest,
    'was received',
    received,
    'and won',
    won,
    'of those times',
  );
}

function testGame() {
  const players = [
    // {name: 'Player 1', cards: [ '9♣', '2♣' ].map(getCard)},
    // {name: 'Player 2', cards: [ 'K♣', '10♣' ].map(getCard)},
    // {name: 'Player 3', cards: [ '5♣', '5♥' ].map(getCard)},
    { name: 'Player 4', cards: ['2♦', '5♦'].map(getCard) },
  ];

  const board = [
    { cards: ['Q♣', '2♣', '3♥'].map(getCard) },
    { cards: ['4♣'].map(getCard) },
    { cards: ['8♣'].map(getCard) },
  ];

  console.log('\n\n');

  players.forEach(player => {
    console.log(player.name, player.cards.map(c => c.display));
  });

  console.log('');

  console.log(board.map(b => b.cards.map(c => c.display)));

  const winners = getWinners({ board, players });

  console.log('');

  printWinners(winners);
}

if (MODE === 'test') {
  testJT();
}

// testStraightFlush();
//Player 1 [ '4♣', '10♦' ]
// Player 2 [ '9♠', '6♠' ]
// Discarding 1 card(s) for flop
// Discarding 1 card(s) for turn
// Discarding 1 card(s) for river

// ---BOARD---
// [ [ '8♦', '3♠', '2♣' ], [ 'A♠' ], [ '8♥' ] ]

// --- WINNER ---
// Player 1 has Pair
// Player 2 has Pair
// Player 2 wins with Pair [ '8♦', '8♥', '9♠', '6♠', '3♠' ]
