import { InitialPlayerInterface } from './interfaces';
import { TerminalTable } from './TerminalTable';

const players: InitialPlayerInterface[] = [
  {
    name: 'Igor',
    chips: 500,
  },
  {
    name: 'Lucas',
    chips: 500,
  },
  {
    name: 'Matheus',
    chips: 500,
  },
  // {
  //   name: 'Gustavo',
  //   chips: 500,
  // },
];

const table = new TerminalTable({
  players,
  handsCount: 3,
  currency: 'R$',
  gameType: 'holdem',
  gameLimit: 'no-limit',
  stakes: [5, 10],
});

table.start();
