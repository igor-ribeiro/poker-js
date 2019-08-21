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
import { HANDS_RANKING } from '../config';

test('Trips vs Trips (TTT vs 555)', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', '10♦'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['5♣', '5♦'].map(getCard),
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
  expect(hands[0].hand.name).toBe(HANDS_RANKING.TRIPS.name);
  expect(hands[0].hand.cards).toEqual(
    ['10♣', '10♦', '10♠', '9♠', '7♣'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe(HANDS_RANKING.TRIPS.name);
  expect(hands[1].hand.cards).toEqual(
    ['5♣', '5♦', '5♥', '10♠', '9♠'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});

test('Trips vs Trips (TTT A vs TTT K) [kicker]', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', 'A♦'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['K♣', '10♦'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['10♠', '9♠', '7♣', '10♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe(HANDS_RANKING.TRIPS.name);
  expect(hands[0].hand.cards).toEqual(
    ['10♣', '10♠', '10♥', 'A♦', '9♠'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe(HANDS_RANKING.TRIPS.name);
  expect(hands[1].hand.cards).toEqual(
    ['10♦', '10♠', '10♥', 'K♣', '9♠'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});
