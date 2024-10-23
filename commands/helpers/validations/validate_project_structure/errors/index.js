export class ResourceNameInvalidException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResourceNameInvalidException';
  }
};

export class ResourceHandlerNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResourceHandlerNotFoundException';
  }
};