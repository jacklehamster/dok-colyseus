// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { TournamentRoundApi } from "./library/TournamentRoundApi";
import http from 'http';

export function hookTournamentApi(
    params: URLSearchParams = new URLSearchParams(global?.location?.search),
    request?: Partial<http.IncomingMessage>,
    tournament: Partial<TournamentRoundApi> = new TournamentRoundApi(
      process.env.ARCADIA_API_URL || "http://127.0.0.1:2567",
      process.env.ARCADIA_API_CLIENT_ID ?? "",
      process.env.ARCADIA_API_CLIENT_SECRET ?? ""
    ),
  ) {
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
      tournament.startTournamentRound?.(playerId, tournamentId, token, walletAddress, playerIp);
    },
    endTournamentRound: (score: number) => {
      tournament.endTournamentRound?.(playerId, tournamentId, token, score);
    },
  };
}
