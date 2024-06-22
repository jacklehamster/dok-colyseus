import { hookTournamentApi } from './index';
import { TournamentRoundApi } from './library/TournamentRoundApi';
import http from 'http';

describe('hookTournamentApi', () => {
  let mockParams: URLSearchParams;
  let mockRequest: Partial<http.IncomingMessage> | undefined;
  let mockTournament: Partial<TournamentRoundApi>;

  beforeEach(() => {
    mockParams = new URLSearchParams();
    mockRequest = undefined;
    mockTournament = {};
  });

  it('should return correct data when params, request, and tournament are provided', () => {
    mockParams.set('playerid', '123');
    mockParams.set('tourneyid', '456');
    mockParams.set('otp', 'token');
    mockParams.set('displayname', 'John Doe');
    mockParams.set('wallet_address', 'abc123');
    mockRequest = {
      headers: {
        'x-forwarded-for': '192.168.0.1',
      },
    };

    const api = hookTournamentApi(mockParams, mockRequest, mockTournament);

    expect(api.displayName).toBe('John Doe');
    expect(api.startTournament).toBeDefined();
    expect(api.endTournamentRound).toBeDefined();

    // Mock the startTournamentRound and endTournamentRound functions
    const mockStartTournamentRound = jest.fn();
    const mockEndTournamentRound = jest.fn();
    mockTournament.startTournamentRound = mockStartTournamentRound;
    mockTournament.endTournamentRound = mockEndTournamentRound;

    api.startTournament?.();
    api.endTournamentRound?.(100);

    expect(mockStartTournamentRound).toHaveBeenCalledWith('123', '456', 'token', 'abc123', '192.168.0.1');
    expect(mockEndTournamentRound).toHaveBeenCalledWith('123', '456', 'token', 100);
  });

  it('should handle missing params, request, and tournament gracefully', () => {
    const api = hookTournamentApi(); // No params, request, or tournament provided

    expect(api.displayName).toBe('');
    expect(api.imageUrl).toBe('');
    expect(api.startTournament).toBeDefined();
    expect(api.endTournamentRound).toBeDefined();

    // Mock the startTournamentRound and endTournamentRound functions
    const mockStartTournamentRound = jest.fn();
    const mockEndTournamentRound = jest.fn();
    mockTournament.startTournamentRound = mockStartTournamentRound;
    mockTournament.endTournamentRound = mockEndTournamentRound;

    api.startTournament?.();
    api.endTournamentRound?.(100);

    expect(mockStartTournamentRound).not.toHaveBeenCalled();
    expect(mockEndTournamentRound).not.toHaveBeenCalled();
  });
});
