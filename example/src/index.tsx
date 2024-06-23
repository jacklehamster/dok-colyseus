// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { hookTournamentApi } from "dok-colyseus";

const div = document.body.appendChild(document.createElement("div"));

function HelloComponent() {
  const { startTournament, endTournamentRound } = hookTournamentApi({
    baseUrl: "http://127.0.0.1:2567",
    clientId: "<CLIENT-ID>",
    clientSecret: "<CLIENT-SECRET>",
  });

  return <>
    <button type="button" onClick={() => startTournament()}>Start tournament</button>
    <button type="button" onClick={() => endTournamentRound(10)}>End tournament</button>
  </>;
}

//  HelloComponent
const root = createRoot(div);
root.render(location.search.indexOf("strict-mode") >= 0 ?
  <StrictMode>
    <><HelloComponent/></>
  </StrictMode> : <><HelloComponent/></>
);
