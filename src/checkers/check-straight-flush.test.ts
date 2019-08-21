import { HANDS_RANKING } from '../config';
import { PlayerInterface, CardInterface } from '../interfaces';
import { checkHoldem } from './check-holdem';
import { getCard, getWinners, getFinalHand } from '../helpers';

test('Straight Flush vs Straight Flush (A-5 vs 2-6) [kicker]', () => {
  const players: PlayerInterface[] = [
    {
      name: 'Player 1',
      chips: 100,
      cards: ['10♠', 'A♣'].map(getCard),
      initialChips: 100,
      position: 'SMALL_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
    {
      name: 'Player 2',
      chips: 100,
      cards: ['K♠', '6♣'].map(getCard),
      initialChips: 100,
      position: 'BIG_BLIND',
      getDisplay: () => '',
      betsByRound: [],
    },
  ];

  const boardCards = ['J♠', '5♣', '2♣', '3♣', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  const winners = getWinners(hands);

  const fistPlayerCards: CardInterface[] = ['5♣', '4♣', '3♣', '2♣', 'A♣'].map(
    c => {
      const card = getCard(c);

      if (card.value === 'A') {
        card.score = 1;
      }

      return card;
    },
  );

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe(HANDS_RANKING.STRAIGHT_FLUSH.name);
  expect(hands[0].hand.cards).toEqual(fistPlayerCards);

  expect(hands[1].player.name).toBe('Player 2');
  expect(hands[1].hand.name).toBe(HANDS_RANKING.STRAIGHT_FLUSH.name);
  expect(hands[1].hand.cards).toEqual(
    ['6♣', '5♣', '4♣', '3♣', '2♣'].map(getCard),
  );

  expect(winners.length).toBe(1);
  expect(winners[0].player.name).toBe('Player 2');
});

test('Royal Straight Flush', () => {
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
  ];

  const boardCards = ['J♠', 'J♣', 'K♣', 'Q♣', '4♣'].map(getCard);

  const hands = players.map(player =>
    getFinalHand({
      player,
      boardCards,
      checker: checkHoldem,
    }),
  );

  expect(hands[0].player.name).toBe('Player 1');
  expect(hands[0].hand.name).toBe(HANDS_RANKING.ROYAL_STRAIGHT_FLUSH.name);
  expect(hands[0].hand.cards).toEqual(
    ['A♣', 'K♣', 'Q♣', 'J♣', '10♣'].map(getCard),
  );
});
