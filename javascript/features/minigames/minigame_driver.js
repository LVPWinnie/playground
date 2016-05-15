// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const Minigame = require('features/minigames/minigame.js');

// A minigame driver contains the information required to run an individual minigame. It will keep
// track of the engaged players, their states and will automatically unregister the minigame when
// no more players are engaged with it.
class MinigameDriver {
    constructor(manager, category, minigame) {
        this.manager_ = manager;
        this.category_ = category;
        this.minigame_ = minigame;

        // Set containing the players actively engaged in the minigame.
        this.activePlayers_ = new Set();

        // Set containing *all* players that have been engaged with the minigame.
        this.players_ = new Set();
    }

    // Gets the set of players who are currently actively engaged in the minigame.
    get activePlayers() { return this.activePlayers_; }

    // Gets the minigame that has been wrapped by this driver.
    get minigame() { return this.minigame_; }

    // Adds |player| to the minigame.
    addPlayer(player) {
        // TODO(Russell): Make sure that the minigame is in sign-up phase unless it's configured
        // to allow players being added at any time. (In which case their state needs to be set up).

        this.activePlayers_.add(player);
        this.players_.add(player);

        // Inform the manager about |player| having joined the game.
        this.manager_.didAddPlayerToMinigame(player, this);

        // Inform the minigame about |player| having joined the game.
        this.minigame_.onPlayerAdded(player);
    }

    // Serializes the current state of |player|, making sure that whatever happens to them within
    // the minigame does not affect their status elsewhere on the server.
    serializePlayerState(player) {
        // TODO(Russell): Serialize the player's state.
    }

    // Removes |player| from the minigame because of |reason|. Will trigger the onPlayerRemoved
    // method on the minigame object, and free the |player|'s state in the minigame manager.
    removePlayer(player, reason) {
        if (!this.activePlayers_.has(player))
            return;

        this.activePlayers_.delete(player);

        // Inform the minigame about |player| leaving the activity.
        this.minigame_.onPlayerRemoved(player, reason);

        // Restore their state after the minigame had a chance to do their things.
        this.restorePlayerState(player);

        // Clear the player's state from the minigame manager.
        this.manager_.didRemovePlayerFromMinigame(player);

        // Check whether the minigame has finished in its entirety. This is the case when there are
        // no more active players and the |player| is not being removed because it's finished.
        if (reason != Minigame.REASON_FINISHED) {
            if (this.activePlayers_.size < this.minigame_.minimumParticipants)
                this.finish(Minigame.REASON_NOT_ENOUGH_PLAYERS);
        }
    }

    // Restores the state of |player| by respawning them in the main world and deserializing their
    // state in the Pawn part of Las Venturas Playground.
    restorePlayerState(player) {
        // TODO(Russell): Restore the player's state.
    }

    // Finishes the minigame. The minigame will be informed, after which the remaining players will
    // be respawned and the minigame will be removed from the manager.
    finish(reason) {
        // Inform the minigame about it having finished. There may still be active players left
        // within the game, these will be removed immediately after.
        this.minigame_.onFinished(reason);

        for (let player of this.activePlayers_)
            this.removePlayer(player, Minigame.REASON_FINISHED);

        // Informs the manager that the minigame owned by this driver has finished.
        this.manager_.didFinishMinigame(this.category_, this);
    }

    dispose() {
        this.activePlayers_ = null;
        this.players_ = null;
    }
}

exports = MinigameDriver;
