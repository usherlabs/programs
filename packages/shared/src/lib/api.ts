import ky from "ky";
import { KyInstance } from "ky/distribution/types/ky";
import { ApiOptions } from "./options";

export class Api {
  private _request: KyInstance;

  constructor(options?: ApiOptions) {
    const prefixUrl =
      options && options.url
        ? options.url
        : options && options.environment == "staging"
          ? "https://app.staging.usher.so/api"
          : "https://app.usher.so/api";

    this._request = ky.create({ prefixUrl });
  }

  protected getRequest() {
    return this._request;
  }

  protected getAuthRequest(authToken: string) {
    return this.getRequest().extend({
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }
}