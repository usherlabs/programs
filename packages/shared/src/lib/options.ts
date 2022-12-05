export interface EnvOptions {
  environment?: "production" | "staging";
}

export interface ApiOptions extends EnvOptions {
  url?: string;
}
