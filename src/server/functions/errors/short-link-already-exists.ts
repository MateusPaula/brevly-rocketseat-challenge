export class ShortLinkAlreadyExistsError extends Error {
  constructor() {
    super('The short link already exists')
  }
}
