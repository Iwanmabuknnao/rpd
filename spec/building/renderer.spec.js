describe('building: renderer', function() {

    xit('should have an alias', function() {
        expect(function() {
            Rpd.renderer();
        }).toThrow();
    });

    it('receives no events if no target was specified', function() {

        var fooUpdateSpy = jasmine.createSpy('foo-update');
        var fooRenderer = Rpd.renderer('foo', function(user_conf) {
            return fooUpdateSpy;
        });

        var barUpdateSpy = jasmine.createSpy('bar-update');
        var barRenderer = Rpd.renderer('bar', function(user_conf) {
            return barUpdateSpy;
        });

        Rpd.Model.start('foo')
                 .renderWith('foo')
                 .renderWith('bar');

        expect(fooUpdateSpy).not.toHaveBeenCalled();
        expect(barUpdateSpy).not.toHaveBeenCalled();

    });

    it('receives all events, if at least one target was specified', function() {

        var fooUpdateSpy = jasmine.createSpy('foo-update');
        var fooRenderer = Rpd.renderer('foo', function(user_conf) {
            return fooUpdateSpy;
        });

        var barUpdateSpy = jasmine.createSpy('bar-update');
        var barRenderer = Rpd.renderer('bar', function(user_conf) {
            return barUpdateSpy;
        });

        var targetOne = {}, targetTwo = {}, targetThree = {};

        Rpd.Model.start()
                 .renderWith('foo')
                 .attachTo(targetOne)
                 .attachTo(targetTwo)
                 .renderWith('bar')
                 .attachTo(targetThree);

        expect(fooUpdateSpy).toHaveBeenCalledWith(targetOne,
                             jasmine.objectContaining({ type: 'model/new' }));
        expect(fooUpdateSpy).toHaveBeenCalledWith(targetTwo,
                             jasmine.objectContaining({ type: 'model/new' }));
        expect(fooUpdateSpy).toHaveBeenCalledWith(targetThree,
                             jasmine.objectContaining({ type: 'model/new' }));

        expect(barUpdateSpy).toHaveBeenCalledWith(targetOne,
                             jasmine.objectContaining({ type: 'model/new' }));
        expect(barUpdateSpy).toHaveBeenCalledWith(targetTwo,
                             jasmine.objectContaining({ type: 'model/new' }));
        expect(barUpdateSpy).toHaveBeenCalledWith(targetThree,
                             jasmine.objectContaining({ type: 'model/new' }));

    });

    it('is called once for every new model', function() {
        var updateSpy = jasmine.createSpy('update');
        var rendererSpy = jasmine.createSpy('renderer').and.returnValue(function() {});

        Rpd.renderer('foo', rendererSpy);

        Rpd.Model.start().renderWith('foo');
        expect(rendererSpy).toHaveBeenCalledOnce();
        Rpd.Model.start().renderWith('foo');
        expect(rendererSpy).toHaveBeenCalledTwice();

    });

    it('receives configuration passed from a user', function() {
        var configurationSpy = jasmine.createSpy('configuration');
        var renderer = Rpd.renderer('foo', function(user_conf) {
            configurationSpy(user_conf);
            return function() {};
        });

        var confMock = {};

        Rpd.Model.start().renderWith('foo', confMock);

        expect(configurationSpy).toHaveBeenCalledWith(confMock);
    });

    it('could handle specific events', function() {
        var newModelSpy = jasmine.createSpy('new-node');
        var renderer = Rpd.renderer('foo', function() {
            return function(root, update) {
                if (update.type === 'model/new') newModelSpy();
            };
        });

        Rpd.Model.start().renderWith('foo').attachTo({});

        new Rpd.Node('spec/empty');

        expect(newModelSpy).toHaveBeenCalled();
    });

    xdescribe('postponing updates', function() {

        it('gets construction events happened before, if it was assigned after the fact these modifications were performed', function() {
            var updateSpy = jasmine.createSpy('update');

            var renderer = Rpd.renderer('foo', function() { return updateSpy; });

            var model = Rpd.Model.start();
            var node = new Rpd.Node('spec/empty');
            var inlet = node.addInlet('spec/pass', 'foo');

            model.renderWith('foo');
            expect(updateSpy).not.toHaveBeenCalled();
            model.attachTo({});

            expect(updateSpy).toHaveBeenCalledWith(
                jasmine.anything(),
                jasmine.objectContaining({
                    type: 'node/add',
                    node: node
                }));
            expect(updateSpy).toHaveBeenCalledWith(
                jasmine.anything(),
                jasmine.objectContaining({
                    type: 'inlet/add',
                    inlet: inlet
                }));
        });

    });

});
