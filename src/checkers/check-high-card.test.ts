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

test('High vs High (Q vs 9)', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', 'Q♣'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['9♣', '5♣'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['2♠', '8♠', '7♣', '3♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe('High card');
  expect(hands[0].hand.cards).toEqual(
    ['Q♣', '10♣', '8♠', '7♣', '4♣'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe('High card');
  expect(hands[1].hand.cards).toEqual(
    ['9♣', '8♠', '7♣', '5♣', '4♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(hands[0].player.name).toBe('Player 1');
});

test('High vs High (QT vs Q9)', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♣', 'Q♣'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['9♣', 'Q♠'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['2♠', '8♠', '7♣', '3♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe('High card');
  expect(hands[0].hand.cards).toEqual(
    ['Q♣', '10♣', '8♠', '7♣', '4♣'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe('High card');
  expect(hands[1].hand.cards).toEqual(
    ['Q♠', '9♣', '8♠', '7♣', '4♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(winners[0].player.name).toBe('Player 1');
});
