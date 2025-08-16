export class LinkNotFoundError extends Error {
  constructor() {
    super('The link was not found')
  }
}
