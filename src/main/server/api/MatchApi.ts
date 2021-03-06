import { Request, Response } from 'express';
import { arena } from '../Arena';
import { UserDocument, UserService } from '../models/UserModel';
import MatchModel, { MatchService } from '../models/MatchModel';
import ResponseCreator from './ResponseCreator';
import Zip from '../utils/Zip';
import Env from '../Env';

const colors = ['#866', '#262', '#c55', '#44b'];

export async function list(req: Request, res: Response) {
  if (!req.session && !Env.isPublishGames) {
    return res
      .status(400)
      .send('Bad Request')
      .end();
  }

  const matches = await MatchService.matches();
  const matchesResponse = matches.map(v => {
    return ResponseCreator.match(v);
  });
  res
    .status(200)
    .type('json')
    .send(matchesResponse)
    .end();
}

export async function show(req: Request, res: Response) {
  if (!req.session && !Env.isPublishGames) {
    return res
      .status(400)
      .send('Bad Request')
      .end();
  }

  const matchId: string = req.params.id;
  const match = await MatchService.load(matchId);
  if (!match) {
    return res
      .status(400)
      .send('Bad Request')
      .end();
  }
  res
    .status(200)
    .type('json')
    .send(ResponseCreator.match(match))
    .end();
}

export async function replay(req: Request, res: Response) {
  if (!req.session && !Env.isPublishGames) {
    return res
      .status(400)
      .send('Bad Request')
      .end();
  }

  const matchId: string = req.params.id;
  const match = await MatchService.loadWithReplay(matchId);
  if (!match) {
    return res
      .status(400)
      .send('Bad Request')
      .end();
  }
  const unziped = await Zip.unzip(match.dump);
  res
    .status(200)
    .type('json')
    .send(unziped)
    .end();
}

export async function create(req: Request, res: Response) {
  if (!req.session) {
    return res
      .status(400)
      .send('Bad Request')
      .end();
  }

  let player1: string;
  let player2: string;
  if (req.params.player1 && req.params.player2 && req.session.admin) {
    // for admin
    player1 = req.params.player1;
    player2 = req.params.player2;
  } else {
    // for user
    const user = req.session.user as UserDocument;
    if (!user) {
      return res
        .status(403)
        .send('')
        .end();
    }
    player1 = user.account;
    player2 = req.params.id;
    if (!player2) {
      return res
        .status(400)
        .send('')
        .end();
    }
  }
  const user1 = await UserService.loadByAccount(player1, true);
  const user2 = await UserService.loadByAccount(player2, true);

  if (!user1 || !user2) {
    return res
      .status(400)
      .send('')
      .end();
  }

  const matchResult = await arena([
    { account: user1.account, name: user1.name, color: colors[0], source: user1.source },
    { account: user2.account, name: user2.name, color: colors[1], source: user2.source }
  ]);

  const deflated = await Zip.deflate(JSON.stringify(matchResult));

  const match = new MatchModel();
  if (matchResult.result) {
    match.winner = matchResult.result.winnerId === 0 ? user1 : user2;
  }
  match.dump = deflated;
  match.players = [user1, user2];

  const matchDocument = await MatchService.createAndRegisterToUser(match);

  return res
    .status(200)
    .type('json')
    .send({ _id: matchDocument._id })
    .end();
}
