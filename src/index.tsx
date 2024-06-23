// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// import { GameRoom } from "./library/GameRoom";
import { TournamentRoundApi } from "./library/TournamentRoundApi";
import http from 'http';

interface TournamentParams {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export function hookTournamentApi(
  tournamentParams: TournamentParams,
  params: URLSearchParams = new URLSearchParams(globalThis?.location?.search),
  request?: Partial<http.IncomingMessage>) {
  const tournament = new TournamentRoundApi(
    tournamentParams?.baseUrl,
    tournamentParams?.clientId,
    tournamentParams?.clientSecret,
  );
  const playerId = params.get("playerid") ?? "";
  const tournamentId = params.get("tourneyid") ?? "";
  const token = params.get("otp") ?? "";
  const displayName = decodeURIComponent(params.get("displayname") ?? "");
  const walletAddress = params.get("wallet_address") ?? "";
  const playerIp = request?.headers?.["x-forwarded-for"]?.toString() ?? "";
  const imageUrl = params.get("image_url") ?? "";

  return {
    displayName,
    imageUrl,
    startTournament: () => {
      tournament?.startTournamentRound?.(playerId, tournamentId, token, walletAddress, playerIp);
    },
    endTournamentRound: (score: number) => {
      tournament?.endTournamentRound?.(playerId, tournamentId, token, score);
    },
  };
}
