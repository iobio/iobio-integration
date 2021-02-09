const defaultBackendMap = {
  "anySource": [
    "backend.iobio.io",
    "mosaic.chpc.utah.edu/gru-dev",
  ],
  "https://mosaic.chpc.utah.edu": [
    "mosaic.chpc.utah.edu/gru/api/v1",
  ],
  "https://cddrc.utah.edu": [
    "mosaic.chpc.utah.edu/gru/api/v1",
  ],
  "https://mosaic-staging.chpc.utah.edu": [
    "mosaic-staging.chpc.utah.edu/gru/api/v1",
  ]
};


export class LaunchConfigManager {
  constructor(options) {
    this.options = options;
  }

  async getConfig() {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        getLaunchConfig(this.options).then(config => {
          this.config = config;
          resolve(config);
        });
      }
      else {
        resolve(this.config);
      }
    });
  }
}

async function getLaunchConfig(options) {

  const urlParams = new URLSearchParams(location.search);

  const promises = [];

  let backendMap = defaultBackendMap;
  let params = {};

  // load backendMap and/or config in parallel

  if (options.backendMapLocation) {
    const backendMapPromise = new Promise((resolve, reject) => {
      fetch(options.backendMapLocation).then(r => r.json()).then(loadedBackendMap => {
        backendMap = loadedBackendMap
        resolve();
      });
    });
    promises.push(backendMapPromise);
  }

  if (urlParams.has('config')) {
    const configPromise = new Promise((resolve, reject) => {
      fetch(urlParams.get('config')).then(r => r.json()).then(config => {
        params = config;
        resolve();
      });
    });
    promises.push(configPromise);
  }
  else if (options.configLocation) {
    const configPromise = new Promise((resolve, reject) => {
      fetch(options.configLocation).then(r => r.json()).then(config => {
        params = config;
        resolve();
      });
    });
    promises.push(configPromise);
  }

  // wait for both to be ready
  return Promise.all(promises).then(() => {

    // url params have precendence over config params
    for (const key of urlParams.keys()) {
      const array = urlParams.getAll(key);

      if (array.length > 1) {
        params[key] = urlParams.getAll(key);
      }
      else {
        params[key] = urlParams.get(key);
      }
    }

    let source = params.source;
    if (!source && params.bam) {
      const url = new URL(params.bam);
      source = url.origin;
    }

    let backend = backendMap.anySource.length > 0 ? backendMap.anySource[0] : 'backend.iobio.io'; 

    if (backendMap.anySource.includes(params.backend) || 
      (backendMap[source] && backendMap[source].includes[params.backend])) {
      backend = params.backend;
    }
    else if (backendMap[source]) {
      backend = backendMap[source][0];
    }

    const launchConfig = {
      backendUrl: backend,
      params,
    };

    return launchConfig;
  });
}
