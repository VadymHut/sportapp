import 'ra-core';

declare module 'ra-core' {
  interface UserIdentity {
    username?: string;
    name?: string;
    surname?: string;
    staffId?: number;
    roles?: string[];
  }
}
