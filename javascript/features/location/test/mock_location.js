// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const Feature = require('components/feature_manager/feature.js');
const InteriorManager = require('features/location/interior_manager.js');

// Mocked version of the Location feature providing the API interfaces.
class MockLocation extends Feature {
    constructor() {
        super();

        this.interiorManager_ = new InteriorManager();
    }

    // ---------------------------------------------------------------------------------------------

    // Creates the teleportation |portal| in the Interior Manager. The |portal| must be a complete
    // instance of the Portal class.
    createPortal(portal) {
        this.interiorManager_.createPortal(portal, false /* isToggleable */);
    }

    // Removes the teleportation |portal| from the Interior Manager. The |portal| must be a complete
    // instance of the Portal class that previously was added using createPortal().
    removePortal(portal) {
        this.interiorManager_.removePortal(portal);
    }

    // ---------------------------------------------------------------------------------------------

    dispose() {
        this.interiorManager_.dispose();
        this.interiorManager_ = null;
    }
}

exports = MockLocation;
