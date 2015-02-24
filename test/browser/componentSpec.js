describe('Component', function () {
  describe('when you listen to stores', function () {
    describe('when the store changes', function () {
      it('should call `getState`');
      it('should update the components state with the result of `getState`');
    });

    describe('when you dont implement `getState`', function () {
      it('should throw an error');
    });
  });
});