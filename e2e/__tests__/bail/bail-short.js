it('should fail short', (done) => {
  setTimeout(() => {
    done(new Error('Test error'));
  }, 1000);
});
