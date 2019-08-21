import { Chalk } from 'chalk/types';
import chalk from 'chalk';
import * as prompts from 'prompts';

import { AbstractRenderer } from './renderers/AbstractRenderer';
import { BOARD_STRUCTURE, CARDS_PER_PLAYER } from './config';
import {
  CardInterface,
  CardSuitsType,
  PotActionType,
  PotActionsType,
  TablePositionTypes,
  PotActionWinInterface,
} from './interfaces';
import { Table } from './Table';
import { getValueDisplay } from './helpers';

const MAX_WIDTH = 50;

export class TerminalTable extends Table implements AbstractRenderer {
  public async render() {
    console.clear();

    await this.renderStart();
    await this.renderBoard();
    await this.renderPot();
    await this.renderPlayers();
    await this.renderWinners();
    // await this.renderStatus();
    // await this.renderPlayerOptions();
  }

  public async renderStatus() {
    console.log('');

    if (this.currentPlayer < 0) {
      return;
    }

    const position = this.positions[this.currentPlayer];

    if (position == null) {
      return;
    }

    // console.log(
    //   chalk
    //     .bgRgb(0, 0, 0)
    //     .greenBright(
    //       String(' Current round: ' + this.currentRound).padEnd(50, ' '),
    //     ),
    // );

    // const playerBets = this.betsByPlayerAndRound[position.player.name][
    //   this.currentRound
    // ];

    // const lastPlayerBet = playerBets[playerBets.length - 1];

    // console.log(
    //   chalk
    //     .bgRgb(0, 0, 0)
    //     .greenBright(String(' Bets: ' + this.bettingRounds).padEnd(50, ' ')),
    // );

    // console.log(
    //   chalk
    //     .bgRgb(0, 0, 0)
    //     .greenBright(
    //       String(
    //         ' Has player bet: ' + Object.values(lastPlayerBet || {}),
    //       ).padEnd(50, ' '),
    //     ),
    // );

    console.log(
      chalk
        .bgRgb(0, 0, 0)
        .greenBright(
          String(' Wating player: ' + position.player.name).padEnd(50, ' '),
        ),
    );

    console.log(
      chalk
        .bgRgb(0, 0, 0)
        .greenBright(
          String(
            ' Last aggressor: ' +
              this.lastAggressorIndex +
              (this.lastAggressorIndex < 0
                ? 'null'
                : this.positions[this.lastAggressorIndex].player.name),
          ).padEnd(50, ' '),
        ),
    );
  }

  public async renderStart() {
    // console.clear();

    const state = this.tableActions[this.tableActionIndex];
    const nextState = this.tableActions[this.tableActionIndex + 1];

    const display = [
      '',
      this.gameLimit.toUpperCase(),
      this.gameType.toUpperCase(),
      this.stakes.map(stake => getValueDisplay(stake, this.currency)).join('/'),
      `[${state} > ${nextState}]`,
    ].join(' ');

    console.log(chalk.bgWhite.black(display));
  }

  public async renderBoard() {
    console.log('');
    let boardDisplay = '';

    const boardsTemplate = BOARD_STRUCTURE[this.gameType];

    for (let boardIndex = 0; boardIndex < boardsTemplate.length; boardIndex++) {
      const board = this.board[boardIndex];
      const boardTemplate = boardsTemplate[boardIndex];

      if (board != null) {
        for (let card of board.cards) {
          boardDisplay += await this.renderCard(card);
        }

        boardDisplay += '  ';
      } else {
        for (let card = 0; card < boardTemplate.deal; card++) {
          boardDisplay += await this.renderCard();
        }

        boardDisplay += '  ';
      }
    }

    console.log(boardDisplay, '\n');
  }

  public async renderPot() {
    const pots: string[] = [];

    for (let pot of this.pots) {
      pots.push(
        [
          'Pot:',
          `${getValueDisplay(pot.total, this.currency)}`,
          `[${pot.type.toLowerCase()} pot for ${pot.players.length} players]`,
        ].join(' '),
      );
    }

    console.log(pots.join('\n'));
  }

  public async renderPlayers() {
    console.log();

    const isShowdown = this.tableActions[this.tableActionIndex] === 'SHOWDOW';

    const positionByPlayer: Record<
      string,
      {
        positionType: TablePositionTypes;
        positionIndex: number;
      }
    > = {};

    for (let index = 0; index < this.positions.length; index++) {
      const position = this.positions[index];

      positionByPlayer[position.player.name] = {
        positionType: position.type,
        positionIndex: index,
      };
    }

    for (
      let playerIndex = 0;
      playerIndex < this.players.length;
      playerIndex++
    ) {
      const player = this.players[playerIndex];
      const { positionIndex, positionType } = positionByPlayer[player.name];

      let cardsDisplay = '';

      const isCurrentPlayer = positionIndex === this.currentPlayer;

      const playerColor = isCurrentPlayer ? chalk.bgWhite.black : chalk.white;

      for (
        let cardIndex = 0;
        cardIndex < CARDS_PER_PLAYER[this.gameType];
        cardIndex++
      ) {
        const card = player.cards[cardIndex];

        cardsDisplay += await this.renderCard(
          card,
          isCurrentPlayer || isShowdown,
        );
      }

      let positionDisplay = '   ';

      if (positionType === 'BUTTON') {
        positionDisplay = chalk.bgWhite.black(' B ') + '';
      }

      let currentBet = '';
      let currentAction = '';

      const lastBet = await this.getLastPlayerBet(player);

      if (lastBet != null) {
        [currentBet, currentAction] = await this.getBet(lastBet);
      }

      console.log(
        [
          cardsDisplay,
          playerColor(
            player.name.padEnd(10, ' ') +
              chalk.dim(currentAction.padEnd(7, ' ')) +
              positionDisplay,
          ),
          playerColor(
            String(
              getValueDisplay(player.chips, this.currency).padEnd(10, ' ') +
                currentBet,
            ).padEnd(20, ' '),
          ),
          await this.renderSeparator(20),
        ].join('\n'),
      );
    }
  }

  public async renderWinners() {
    if (this.winners.length === 0) {
      return;
    }

    for (let potIndex = 0; potIndex < this.pots.length; potIndex++) {
      const winnerAction = this.potsActions[this.currentRound][potIndex].find(
        potAction => potAction.action === 'WIN',
      ) as PotActionWinInterface;

      if (winnerAction == null) {
        throw Error('Win pot action not found');
      }

      const pot = winnerAction.pot;

      const potTotalPerPlayer = pot.total / winnerAction.winners.length;
      const action = winnerAction.winners.length > 1 ? 'ties' : 'wins';

      for (let winner of winnerAction.winners) {
        console.log(
          winner.player.name,
          action,
          getValueDisplay(potTotalPerPlayer, this.currency),
          'with',
          winner.hand.name,
          // winner.hand.cards.map(c => c.display),
        );
      }
    }
  }

  public async renderCard(
    card?: CardInterface,
    isVisible?: boolean,
  ): Promise<string> {
    if (card == null) {
      return chalk.bgRgb(80, 80, 80).dim('   ') + ' ';
    }

    if (isVisible === false) {
      return chalk.bgBlue.white('[ ]') + ' ';
    }

    const color = await this.getSuitColor(card.suit);

    return color(`${card.value.padEnd(2, ' ')}${card.suit}`) + ' ';
  }

  public async renderSeparator(size: number = 3): Promise<string> {
    return chalk.dim('-'.repeat(size));
  }

  public async getSuitColor(suit: CardSuitsType): Promise<Chalk> {
    const card = chalk.rgb(250, 250, 250);

    if (suit === '♠') {
      return card.bgRgb(0, 0, 0);
    }

    if (suit === '♣') {
      return card.bgRgb(15, 87, 1);
    }

    if (suit === '♥') {
      return card.bgRed;
    }

    if (suit === '♦') {
      return card.bgBlue;
    }

    return card.black;
  }

  public async getBet(bet: PotActionType): Promise<string[]> {
    switch (bet.action) {
      case 'BET':
      case 'BET_BLIND':
      case 'RAISE':
        return [
          getValueDisplay(bet.amount, this.currency),
          bet.action.toLowerCase().replace('_blind', '') + 's',
        ];
      case 'CALL':
        return [getValueDisplay(bet.amount, this.currency), 'calls'];
      case 'CHECK':
        return ['', 'checks'];
      case 'FOLD':
        return ['', 'folds'];
      default:
        return ['', ''];
    }
  }
}
