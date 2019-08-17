import { Table } from './Table';
import { PlayerInterface, InitialPlayerInterface } from './interfaces';

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

const table = new Table({
  players,
  handsCount: 100,
  currency: 'R$',
  gameType: 'holdem',
  gameLimit: 'no-limit',
  stakes: [5, 10],
});

table.start();
