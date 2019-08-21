import {
  InitialPlayerInterface,
  PlayerInterface,
  CardInterface,
} from '../interfaces';
import { Table } from '../Table';
import { getCard, sortByCardValue, getWinners, getFinalHand } from '../helpers';
import { checkPair } from './check-pair';
import { checkFlush } from './check-flush';
import { checkHoldem } from './check-holdem';

test('Pair vs Pair (KK vs 88)', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['3♣', 'K♦'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['Q♠', '8♥'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['7♥', 'K♥', '5♥', 'J♣', '8♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe('Pair');
  expect(hands[0].hand.cards).toEqual(
    ['K♦', 'K♥', 'J♣', '8♣', '7♥'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe('Pair');
  expect(hands[1].hand.cards).toEqual(
    ['8♥', '8♣', 'K♥', 'Q♠', 'J♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});

test('Pair vs Pair (TT A vs TT K) [kicker]', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♥', 'K♥'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['10♣', 'A♣'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['10♠', '9♠', '7♣', '5♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe('Pair');
  expect(hands[0].hand.cards).toEqual(
    ['10♥', '10♠', 'K♥', '9♠', '7♣'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe('Pair');
  expect(hands[1].hand.cards).toEqual(
    ['10♣', '10♠', 'A♣', '9♠', '7♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(winners[0].player.name).toBe('Player 2');
});

test('Two pair vs Two pair (AA TT vs JJ 55)', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', 'A♣'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['J♣', '5♣'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['10♠', 'A♠', 'J♥', '5♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe('Two pair');
  expect(hands[0].hand.cards).toEqual(
    ['A♣', 'A♠', '10♣', '10♠', 'J♥'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe('Two pair');
  expect(hands[1].hand.cards).toEqual(
    ['J♣', 'J♥', '5♣', '5♥', 'A♠'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});

test('Two pair vs Two pair (AA T vs AA 9) [kicker]', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['A♣', '10♥'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['A♠', '9♦'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['A♥', '2♠', '7♣', '5♦', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe('Pair');
  expect(hands[0].hand.cards).toEqual(
    ['A♣', 'A♥', '10♥', '7♣', '5♦'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe('Pair');
  expect(hands[1].hand.cards).toEqual(
    ['A♠', 'A♥', '9♦', '7♣', '5♦'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(winners[0].player.name).toBe('Player 1');
});
