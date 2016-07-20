// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const Economy = require('features/economy/economy.js');
const HouseManager = require('features/houses/house_manager.js');
const MockHouseDatabase = require('features/houses/test/mock_house_database.js');

describe('HouseManager', (it, beforeEach, afterEach) => {
    let manager = null;

    afterEach(() => manager.dispose());
    beforeEach(() => {
        manager = new HouseManager(new Economy());
        manager.database_ = new MockHouseDatabase();
    });

    it('should be able to load the existing houses', async(assert) => {
        await manager.loadHousesFromDatabase();

        assert.equal(manager.locationCount, 3);
        // TODO: Verify the other pieces of data that can be loaded.
    });

    it('should be able to create new house locations', async(assert) => {
        const gunther = server.playerManager.getById(0 /* Gunther */);
        const locationCount = manager.locationCount;

        gunther.identify();

        await manager.createLocation(gunther, new Vector(50, 50, 10));

        assert.equal(manager.locationCount, locationCount + 1);
    });

    it('should be able to find the closest house to a player', async(assert) => {
        const gunther = server.playerManager.getById(0 /* Gunther */);
        gunther.position = new Vector(200, 200, 300);

        await manager.loadHousesFromDatabase();

        assert.equal(manager.locationCount, 3);

        const closestLocation = await manager.findClosestLocation(gunther);
        assert.isNotNull(closestLocation);

        assert.equal(gunther.position.distanceTo(closestLocation.position), 50);
    });

    it('should be able to limit searches to find the closest house', async(assert) => {
        const gunther = server.playerManager.getById(0 /* Gunther */);
        gunther.position = new Vector(200, 200, 300);

        await manager.loadHousesFromDatabase();

        assert.equal(manager.locationCount, 3);

        const closestLocation =
            await manager.findClosestLocation(gunther, 40 /* maximumDistance */);
        assert.isNull(closestLocation);
    });

    it('should be able to remove existing house locations', async(assert) => {
        const gunther = server.playerManager.getById(0 /* Gunther */);
        gunther.identify();

        assert.equal(manager.locationCount, 0);

        await manager.createLocation(gunther, new Vector(50, 50, 10));
        assert.equal(manager.locationCount, 1);

        const locations = Array.from(manager.locations_);
        assert.equal(locations.length, manager.locationCount);

        const location = locations[0];

        await manager.removeLocation(location);

        assert.equal(manager.locationCount, 0);
    });
});