import { HANDS_RANKING } from '../config';
import { PlayerInterface } from '../interfaces';
import { checkHoldem } from './check-holdem';
import { getCard, getFinalHand, getWinners } from '../helpers';

test('Ace high vs Jack high', () => {
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

  const boardCards = ['5♠', '9♣', '7♣', '4♥', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe(HANDS_RANKING.FLUSH.name);
  expect(hands[0].hand.cards).toEqual(
    ['A♣', '10♣', '9♣', '7♣', '4♣'].map(getCard),
  );

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe(HANDS_RANKING.FLUSH.name);
  expect(hands[1].hand.cards).toEqual(
    ['J♣', '9♣', '7♣', '5♣', '4♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(winners[0].player.name).toBe('Player 1');
});

test('Tie', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['3♣', 'A♠'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['3♠', '5♣'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['A♣', 'J♣', '10♣', '9♣', '7♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  expect(hands[0].hand.name).toBe('Flush');
  expect(hands[0].hand.cards).toEqual(
    ['A♣', 'J♣', '10♣', '9♣', '7♣'].map(getCard),
  );

  expect(hands[1].hand.name).toBe('Flush');
  expect(hands[1].hand.cards).toEqual(
    ['A♣', 'J♣', '10♣', '9♣', '7♣'].map(getCard),
  );

  expect(winners.length).toBe(2);
});
