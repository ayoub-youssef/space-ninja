/*
 * The Hub bridge for Space Ninja.
 *
 * The game is blocks-first: main.blocks is the source of truth and main.ts is
 * generated from it. Nothing here touches either. This file only reads the
 * game's own state and reports a finished run to the exported build's
 * custom.js, which forwards it to the Hub page hosting the game.
 *
 * The game never sees a Hub password, a JWT or a Supabase key. It sends the
 * run's numbers; the Hub works out the Data on its server.
 *
 * The text protocol is deliberately plain: no JSON on this side, because the
 * game compiles for hardware too, where simmessages are ignored anyway.
 *
 *   out   HUB1|READY
 *         HUB1|RUN|score|duck_kills|monkey_kills|final_boss|lives
 *
 *   in    HUB1|SESSION|earning|callsign
 *         HUB1|SUMMARY|data_awarded|earning|line~line~line
 */
namespace hub {
    const CHANNEL = "hub"
    const PROTOCOL = "HUB1"
    const LINE = "~"

    const SCORE_STEP = 100000
    const BOSS_SCORE = 1000000
    const BOSS_UNITS = 10
    const UNIT_BYTES = 64
    const JOKE_SCORE = 9999999
    const WAIT_MS = 4000

    // What the Hub told us about this play. Until a session message arrives
    // the run is treated as a fun run, so the game never claims Data the Hub
    // did not award.
    let earning = false
    let session_received = false

    // The run being played.
    let last_score = 0
    let duck_kills = 0
    let monkey_kills = 0
    let boss_deaths_seen = 0
    let final_boss = false
    let lives_at_end = 0
    let run_sent = false
    // The last projection sent to the Hub. The chip only needs a message when
    // the run's worth actually changes - a score chunk, a kill - not every
    // frame.
    let sent_units = -1

    // The Hub's authoritative summary, if it answers in time.
    let summary_text = ""
    let summary_received = false

    function send(text: string) {
        control.simmessages.send(CHANNEL, Buffer.fromUTF8(text))
    }

    // The loader JSON-parses every sim message before handing it to
    // custom.js, so outbound reports are JSON. They are built by hand: the
    // game has no JSON library, and the shape is three fixed objects.
    function send_ready() {
        send("{\"v\":1,\"action\":\"ready\"}")
    }

    function send_run(score: number) {
        send("{\"v\":1,\"action\":\"run\",\"run\":{\"score\":" + score +
            ",\"duck\":" + duck_kills + ",\"monkey\":" + monkey_kills +
            ",\"final_boss\":" + (final_boss ? 1 : 0) +
            ",\"lives\":" + lives_at_end + "}}")
    }

    // A Buffer is indexable and has a length; that is all the decoding this
    // side needs.
    function buffer_text(buffer: Buffer): string {
        let text = ""
        for (let i = 0; i < buffer.length; i++) {
            text += String.fromCharCode(buffer[i])
        }
        return text
    }

    // Splits on the field separator without String.split, so the file stays
    // within the subset the hardware runtime is happy with. `charCodeAt`
    // rather than `substr`: both exist, but only the former is in pxt's own
    // string compile test, so it is the one with a proven surface.
    function field(text: string, index: number): string {
        let current = 0
        let out = ""
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i)
            if (code == 124) {
                if (current == index) return out
                current += 1
                out = ""
            } else if (current == index) {
                out += String.fromCharCode(code)
            }
        }
        return current == index ? out : ""
    }

    // Everything after the fourth separator: the summary's own text, which is
    // allowed to contain anything except the field separator itself.
    function summary_body(text: string): string {
        let separators = 0
        let body = false
        let out = ""
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i)
            if (!body) {
                if (code == 124) {
                    separators += 1
                    if (separators == 4) body = true
                }
            } else {
                out += String.fromCharCode(code)
            }
        }
        return out
    }

    function to_number(text: string): number {
        let value = 0
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i)
            if (code >= 48 && code <= 57) {
                value = value * 10 + (code - 48)
            }
        }
        return value
    }

    function replace(text: string, from: string, to: string): string {
        let out = ""
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i)
            out += ch == from ? to : ch
        }
        return out
    }

    function on_message(buffer: Buffer) {
        const text = buffer_text(buffer)
        if (field(text, 0) != PROTOCOL) return
        const action = field(text, 1)
        if (action == "SESSION") {
            earning = field(text, 2) == "1"
            session_received = true
        } else if (action == "SUMMARY") {
            // The fourth field onward is the text itself, so a line containing
            // a separator cannot break it.
            summary_text = replace(summary_body(text), LINE, "\n")
            summary_received = true
        }
    }

    // A buffered number with thin spaces for thousands, because the long-text
    // box has no number formatting of its own.
    function group(value: number): string {
        const digits = "" + Math.round(value)
        let out = ""
        let count = 0
        for (let i = digits.length - 1; i >= 0; i--) {
            out = digits.charAt(i) + out
            count += 1
            if (count % 3 == 0 && i > 0) out = " " + out
        }
        return out
    }

    function plural(value: number): string {
        return value == 1 ? "unit" : "units"
    }

    /**
     * The local copy of the Hub's reward rule, used for the game's own
     * summary when the Hub does not answer in time. The Hub's answer wins
     * when it arrives; this only exists so the run still ends with a
     * readable card.
     */
    function local_summary(): string {
        const counted = final_boss ? BOSS_SCORE : last_score
        const score_units = Math.idiv(counted, SCORE_STEP)
        const duck_units = duck_kills
        const monkey_units = monkey_kills * 2
        const boss_units = final_boss ? BOSS_UNITS : 0
        const life_units = final_boss ? lives_at_end : 0
        const units = score_units + duck_units + monkey_units + boss_units + life_units

        let text = "SPACE NINJA - RUN SUMMARY\n\n"
        text += "Score " + group(counted) + ": " + score_units + " " + plural(score_units) + "\n"
        if (duck_kills > 0)
            text += "Space Duck x" + duck_kills + ": " + duck_units + " " + plural(duck_units) + "\n"
        if (monkey_kills > 0)
            text += "Space Monkey x" + monkey_kills + ": " + monkey_units + " " + plural(monkey_units) + "\n"
        if (final_boss) {
            text += "Final boss A M O G U S: " + boss_units + " units\n"
            if (lives_at_end > 0)
                text += "Lives left x" + lives_at_end + ": " + life_units + " " + plural(life_units) + "\n"
        }
        text += "\n"
        if (session_received && earning) {
            text += "TOTAL: " + group(units * UNIT_BYTES) + " bytes awarded."
        } else if (!session_received) {
            text += "Data not connected - open this game from the Hub."
        } else {
            text += "FUN RUN - no Data this time."
        }
        return text
    }

    function finish(win: boolean) {
        if (run_sent) return
        run_sent = true
        final_boss = win
        lives_at_end = win ? info.life() : 0
        const score = win ? BOSS_SCORE : last_score
        send_run(score)

        // The Hub's answer carries the authoritative Data. Waiting in a
        // parallel fiber keeps the game-over screen responsive, and the
        // timeout means a missing answer only costs the nicer wording.
        control.runInParallel(function () {
            let waited = 0
            while (!summary_received && waited < WAIT_MS) {
                pause(100)
                waited += 100
            }
            // The dialog is about to block. Saying so lets the Hub hold its
            // own panel back until this one is dismissed, however long the
            // player takes to read it.
            send("{\"v\":1,\"action\":\"summary_shown\"}")
            game.showLongText(summary_received ? summary_text : local_summary(),
                DialogLayout.Full)
            // The dialog blocks until it is dismissed. Saying so lets the Hub
            // put its own summary up next, instead of covering this one.
            send("{\"v\":1,\"action\":\"summary_seen\"}")
        })
    }

    // A boss's death is counted from the game's own kill counter: main.ts
    // increments bossesKilled on the killing hit and only names the next
    // boss later, so one frame later bossType still names the one that died.
    function track_bosses() {
        if (bossesKilled > boss_deaths_seen) {
            const added = bossesKilled - boss_deaths_seen
            boss_deaths_seen = bossesKilled
            if (bossType == 0) monkey_kills += added
            else if (bossType == 1) duck_kills += added
        }
    }

    // The score is tracked every frame because every game-over path rewrites
    // it: the countdown path restores the high score, and the final boss sets
    // the joke 9,999,999. The run's score is the last real one seen alive.
    function track_score() {
        if (startGame != -1 || gameOver != 0) return
        const score = info.score()
        if (score < JOKE_SCORE) last_score = score
    }

    // The same rule the Hub's server uses, for the live chip. The final
    // boss's own 10 units and the life bonus only land when the run ends, so
    // they are not part of this projection.
    function projected_units(): number {
        const score = last_score > 0 ? last_score : 0
        return Math.idiv(score, SCORE_STEP) + duck_kills + monkey_kills * 2
    }

    function report_progress() {
        if (startGame != -1 || gameOver != 0) return
        const units = projected_units()
        if (units == sent_units) return
        sent_units = units
        const score = last_score > 0 ? last_score : 0
        send("{\"v\":1,\"action\":\"progress\",\"run\":{\"score\":" + score +
            ",\"duck\":" + duck_kills + ",\"monkey\":" + monkey_kills +
            ",\"final_boss\":0,\"lives\":0}}")
    }

    export function boot() {
        control.simmessages.onReceived(CHANNEL, on_message)
        send_ready()

        // Every end of a run goes through here: the countdown, the last life,
        // and the final boss all call game.gameOver(), and the flag says
        // which one it was. That is also why nothing else has to watch the
        // boss's score or its sprite.
        game.onGameOver(function (win: boolean) {
            finish(win)
        })

        game.onUpdate(function () {
            track_bosses()
            track_score()
            report_progress()
        })
    }
}

hub.boot()
