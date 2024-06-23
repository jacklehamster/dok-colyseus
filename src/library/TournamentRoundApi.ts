import axios from "axios";
import CryptoJS from "crypto-js";

export class ErrorCode {
  public static readonly OK = 0;
  public static readonly FAILED = 1;
  public static readonly VALIDATION_ERROR = 1001;
  public static readonly NOT_FOUND = 1002;
  public static readonly ALREADY_EXISTS = 1003;
  public static readonly PLAYER_NOT_FOUND = 1004;
  public static readonly TOURNAMENT_NOT_FOUND = 1005;
  public static readonly TOURNAMENT_HAS_ENDED = 1006;
  public static readonly GAME_NOT_FOUND = 1007;
  public static readonly INVALID_SCORE = 1008;
  public static readonly PLAY_ATTEMPT_EXCEEDED = 1009;
  public static readonly AUTHENTICATION_ERROR = 1010;
  public static readonly TOURNAMENT_NOT_STARTED = 1011;
  public static readonly TOURNAMENT_MAX_PARTICIPANTS_EXCEEDED = 1014;
  public static readonly GUILD_NOT_FOUND = 1015;
  public static readonly TOURNAMENT_PASS_NOT_FOUND = 1016;
  public static readonly PLAYER_DONT_OWN_WALLET = 1017;
}

export interface PlayerScore {
  walletId: string;
  score: number;
}

export interface IResponse<T> {
  status: number;
  msg?: string;
  data?: T;
  err?: any[];
}

export class TournamentRoundApi {
  private static readonly API_END_TOURNAMENT_ROUND =
    "/tournament-round/$tournamentId/end";
  private static readonly API_START_TOURNAMENT_ROUND =
    "/tournament-round/$tournamentId/start";
  private static readonly API_PERSISTENT_SCORE_SUBMIT = "/persistent-score";

  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(baseUrl: string, clientId: string, clientSecret: string) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  submitPersistentScore(
    wallet_address: string,
    score: number,
    otherPlayerScores: PlayerScore[] = []
  ): Promise<IResponse<boolean>> {
    return new Promise((resolve, reject) => {
      const params: any = {
        wallet_address,
        score,
      };

      if (otherPlayerScores.length > 0) {
        params["otherPlayerScores"] = otherPlayerScores;
      }

      const data = this.generateRequestParams(params);

      // console.log("-------");
      // console.log(data);
      // console.log("-------");

      const apiPath = TournamentRoundApi.API_PERSISTENT_SCORE_SUBMIT;
      const url = `${this.baseUrl}${apiPath}`;
      const headers = {
        "Content-Type": "application/json",
      };

      axios
        .post(url, data, { headers })
        .then((resp) => resolve(resp.data))
        .catch(reject);
    });
  }

  endTournamentRound(
    playerId: string,
    tournamentId: string,
    token: string,
    score: number,
    otherPlayerScores: PlayerScore[] = []
  ): Promise<IResponse<boolean>> {
    return new Promise((resolve, reject) => {
      const params: any = {
        playerId,
        tournamentId,
        score,
        token,
      };

      if (otherPlayerScores.length > 0) {
        params["otherPlayerScores"] = otherPlayerScores;
      }

      const data = this.generateRequestParams(params);

      const apiPath = TournamentRoundApi.API_END_TOURNAMENT_ROUND.replace(
        /\$tournamentId/,
        tournamentId
      );
      const url = `${this.baseUrl}${apiPath}`;
      const headers = {
        "Content-Type": "application/json",
      };

      axios
        .post(url, data, { headers })
        .then((resp) => resolve(resp.data))
        .catch(reject);
    });
  }

  //REX: added wallet address
  startTournamentRound(
    playerId: string,
    tournamentId: string,
    token: string,
    walletAddress: string = "",
    playerIp: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const data = this.generateRequestParams({
        playerId,
        tournamentId,
        token,
        walletAddress,
      });

      const apiPath = TournamentRoundApi.API_START_TOURNAMENT_ROUND.replace(
        /\$tournamentId/,
        tournamentId
      );
      const url = `${this.baseUrl}${apiPath}`;
      //Add parameters to the header with the custom names
      const headers = {
        "Content-Type": "application/json",
        "x-arcadia-player-ip": playerIp,
      };

      axios
        .post(url, data, { headers })
        .then((resp) => {
          resolve(resp.data.code === ErrorCode.OK);
        })
        .catch(reject);
    });
  }

  private generateRequestParams(
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const nonce = new Date().getTime();

    params.nonce = nonce;
    params.clientId = this.clientId;

    const paramKeys = Object.keys(params);
    paramKeys.sort((firstEl, secondEl) => firstEl.localeCompare(secondEl));

    let tmpStr = "";
    paramKeys.forEach((paramKey) => {
      if (Object.prototype.hasOwnProperty.call(params, paramKey)) {
        const value =
          typeof params[paramKey] === "object"
            ? JSON.stringify(params[paramKey])
            : params[paramKey];
        tmpStr += `${paramKey}=${value}`;
      }
    });

    // const hash = crypto.createHmac("sha512", this.clientSecret);
    const hmac3 = CryptoJS.HmacSHA512(tmpStr, this.clientSecret).toString();
    //crypto.createHmac('sha256', secret).update(orderedParams).digest('hex')

    // var secret = 'my secret';
    // var orderedParams = 'the ordered params';
    
    // // Short
    // var hmac3 = CryptoJS.HmacSHA256(orderedParams, secret).toString();
    // console.log(hmac3.replace(/(.{48})/g,'$1\n'));
    
    // // Progressive
    // var hmac2 = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secret).update(orderedParams).finalize().toString();
    // console.log(hmac2.replace(/(.{48})/g,'$1\n'));

    // hash.update(tmpStr);

    params.clientAccessToken = hmac3.replace(/(.{48})/g,'$1\n');//hash.digest("hex");

    return params;
  }
}
