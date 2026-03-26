import { check, sleep } from 'k6';
import http from 'k6/http';

// k6 runtime options
export const options = {
  /**
   * Specify if response bodies should be discarded by changing the default
   * value of responseType to none for all HTTP requests. Highly recommended to
   * be set to true and then only for the requests where the response body is
   * needed for scripting to set responseType to text or binary. Lessens the
   * amount of memory required and the amount of GC - reducing the load on the
   * testing machine, and probably producing more reliable test results.
   *
   * Read: https://k6.io/docs/using-k6/k6-options/reference/#discard-response-bodies
   */
  discardResponseBodies: true,
  /**
   * Scenarios make in-depth configurations to how VUs and iterations are
   * scheduled. This makes it possible to model diverse traffic patterns in load
   * tests.
   *
   * Read: https://k6.io/docs/using-k6/scenarios/
   */
  scenarios: {
    health: {
      /**
       * A fixed number of iterations are "shared" between a number of VUs, and
       * the test ends once all iterations are executed. This executor is
       * equivalent to the global vus and iterations shortcut options.
       *
       * Read: https://k6.io/docs/using-k6/scenarios/executors/shared-iterations/
       */
      executor: 'shared-iterations',
      /**
       * Execute 200 total iterations shared by 10 VUs with a maximum duration
       * of 30 seconds.
       */
      vus: 10,
      iterations: 200,
      maxDuration: '30s',
    },
    auth: {
      /**
       * A fixed number of VUs execute as many iterations as possible for a
       * specified amount of time. This executor is equivalent to the global vus
       * and duration options.
       *
       * Read: https://k6.io/docs/using-k6/scenarios/executors/constant-vus/
       */
      executor: 'constant-vus',
      // Name of exported JS function to execute, default is 'default' function
      exec: 'auth',
      /**
       * Run 10 VUs constantly for a duration 30 seconds.
       */
      vus: 10,
      duration: '30s',
    },
    users: {
      /**
       * A variable number of VUs execute as many iterations as possible for a
       * specified amount of time. This executor is equivalent to the global
       * stages option.
       *
       * Read: https://k6.io/docs/using-k6/scenarios/executors/ramping-vus
       */
      executor: 'ramping-vus',
      exec: 'users',
      /**
       * Run a two-stage test, ramping up from 0 to 10 VUs over 20 seconds, then
       * down to 0 VUs over 10 seconds.
       */
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '0s',
    },
  },
};

/**
 * This better be the production replica or staging server with throttler
 * disabled.
 */
const BASE_URL = 'http://localhost:8000';

const endpoints = {
  health: 'health',
  auth: {
    endpoint: 'auth',
    register: 'register',
    login: 'login',
    otp: {
      generate: 'generate',
      verify: 'verify',
    },
    profile: 'profile',
  },
  users: 'users',
  roles: 'roles',
  cards: 'cards',
  points: 'points',
  businesses: 'businesses',
  tenants: 'tenants',
  promotions: 'promotions',
  coupons: 'coupons',
  gifts: 'gifts',
  transactions: 'transactions',
};

// HTTP request params
const params = {
  // cookies: {
  //   '__Host-project.x-csrf-token': 'MY_COOKIE',
  // },
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'k6',
    /**
     * Generate API key from `scripts/generate-api-key.js` and run k6
     * with envrionment variable using `-e` or `--env` CLI flag as below:
     *
     * ```sh
     * $ k6 run -e X_API_KEY=your-x-api-key script.js
     * ```
     */
    'x-api-key': __ENV.X_API_KEY,
    'x-csrf-token': 'MY_TOKEN',
  },
  redirects: 5,
  tags: {
    k6test: 'yes',
  },
};

export default function () {
  const requests = {
    'base URL': {
      method: 'GET',
      url: `${BASE_URL}`,
      body: null,
    },
    /**
     * Diabled because health check does not work on Windows machine
     *
    'health check': {
      method: 'GET',
      url: `${BASE_URL}/${endpoints.health}`,
      body: null,
      params,
    },
    */
  };

  const responses = http.batch(requests);

  check(responses['base URL'], {
    'GET / without API key was 401': (r) => r.status === 401,
  });

  /*
  check(responses['health check'], {
    'GET /health was 200': (r) => r.status === 200,
  });
  */

  sleep(1);
}

export function auth() {
  const requests = {
    'profile without JWT': {
      method: 'GET',
      url: `${BASE_URL}/${endpoints.auth.endpoint}/${endpoints.auth.profile}`,
      body: null,
      params,
    },
  };

  const responses = http.batch(requests);

  check(responses['profile without JWT'], {
    'GET /auth/profile without JWT was 401': (res) => res.status === 401,
  });
}

export function users() {
  const responses = http.batch([
    {
      method: 'POST',
      url: `${BASE_URL}/${endpoints.users}`,
      body: {
        phone: '+959123456789',
        password: 'password',
      },
      params,
    },
    {
      method: 'GET',
      url: `${BASE_URL}/${endpoints.users}`,
      body: null,
      params,
    },
    {
      method: 'GET',
      url: `${BASE_URL}/${endpoints.users}/1`,
      body: null,
      params,
    },
  ]);

  check(responses[0], {
    'POST /users without CSRF token was 403': (r) => r.status === 403,
  });

  responses.slice(1, 3).forEach(function (response) {
    check(response, {
      'GET /users and /users/:id was status 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

export function promotions() {
  const responses = http.batch([
    {
      method: 'POST',
      url: `${BASE_URL}/${endpoints.promotions}`,
      body: {
        business_id: 1,
        about: 'About promotion.',
      },
      params,
    },
    {
      method: 'GET',
      url: `${BASE_URL}/${endpoints.promotions}`,
      body: null,
      params,
    },
    {
      method: 'GET',
      url: `${BASE_URL}/${endpoints.promotions}/1`,
      body: null,
      params,
    },
  ]);

  check(responses[0], {
    'POST /promotions without CSRF token was 403': (r) => r.status === 403,
  });

  responses.slice(1, 3).forEach(function (response) {
    check(response, {
      'GET /promotions and /promotions/:id was status 200': (r) =>
        r.status === 200,
    });
  });

  sleep(1);
}
