/**
 * The Hub bridge for Space Ninja.
 *
 * This is the exported build's one hook into the page around the game. The
 * game itself stays sandboxed: it sends a `messagepacket` on the "hub"
 * channel, the loader hands that here, and this forwards it to the Hub page
 * that frames the game. Nothing here reads the Hub's storage and nothing here
 * can mint Data - it only carries the run's numbers.
 *
 *   game  --messagepacket/hub-->  this file  --postMessage-->  Hub page
 *   game  <--messagepacket/hub--  this file  <--postMessage--  Hub page
 *
 * The stock loader has no path from the exported page back into the
 * simulator, so the inbound half rewraps the Hub's text in the simulator's
 * own `messagepacket` shape and posts it to the sim frame. That is the same
 * message the simulator already accepts from its editor.
 *
 * `?hub_origin=` is put on the URL by the Hub page. When it is present only
 * that origin may drive the bridge; when it is absent the game is being
 * played somewhere else (the editor, a direct visit) and the bridge stays
 * inert.
 */
(function () {
    var CHANNEL = 'hub';
    var GAME_SOURCE = 'the-hub/space-ninja';
    var HUB_SOURCE = 'the-hub-bridge';

    var params;
    try {
        params = new URLSearchParams(window.location.search);
    } catch (e) {
        params = null;
    }
    var HUB_ORIGIN = params ? (params.get('hub_origin') || '') : '';

    function sim_frame() {
        return document.getElementById('simframe');
    }

    function to_hub(message) {
        if (window.parent === window) return;
        if (!HUB_ORIGIN) return;
        window.parent.postMessage(message, HUB_ORIGIN);
    }

    // Outbound: the game's own reports.
    addSimMessageHandler(CHANNEL, function (data) {
        if (!data || data.v !== 1) return;
        if (data.action === 'ready') {
            to_hub({ source: GAME_SOURCE, type: 'ready' });
        } else if (data.action === 'run') {
            to_hub({ source: GAME_SOURCE, type: 'run', run: data.run });
        } else if (data.action === 'progress') {
            // A live projection for the Hub's chip: the run's worth so far.
            to_hub({ source: GAME_SOURCE, type: 'progress', run: data.run });
        } else if (data.action === 'summary_shown') {
            // The game's summary dialog is up; the Hub holds its panel back
            // until the player has dismissed it.
            to_hub({ source: GAME_SOURCE, type: 'summary_shown' });
        } else if (data.action === 'summary_seen') {
            // The in-game summary has been dismissed, so the Hub can show its
            // own without covering it.
            to_hub({ source: GAME_SOURCE, type: 'summary_seen' });
        }
    });

    // Inbound: the Hub's session and summary. The game side is plain text,
    // so the text is carried as one string and turned back into bytes here.
    window.addEventListener('message', function (event) {
        var data = event.data;
        if (!data || data.source !== HUB_SOURCE || data.channel !== CHANNEL) return;
        if (HUB_ORIGIN && event.origin !== HUB_ORIGIN) return;

        var frame = sim_frame();
        if (!frame || !frame.contentWindow) return;

        var text = String(data.text || '');
        var bytes = [];
        for (var i = 0; i < text.length; i++) {
            bytes.push(text.charCodeAt(i) & 0xff);
        }
        frame.contentWindow.postMessage({
            type: 'messagepacket',
            channel: CHANNEL,
            data: bytes
        }, '*');
    });
})();
