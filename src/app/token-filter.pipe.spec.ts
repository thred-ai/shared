import { TokenFilterPipe } from './token-filter.pipe';

describe('TokenFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new TokenFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
