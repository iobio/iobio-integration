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


let launchConfig;
export async function getLaunchConfig() {

  if (launchConfig) {
    return launchConfig;
  }

  const urlParams = new URLSearchParams(location.search);

  const promises = [];

  if (urlParams.get('backend_map') === 'local') {
    const backendMapPromise = new Promise((resolve, reject) => {
      fetch('/config/backend_map.json').then(r => r.json()).then(backendMap => {
        resolve(backendMap);
      });
    });
    promises.push(backendMapPromise);
  }

  if (urlParams.has('config')) {
    const configPromise = new Promise((resolve, reject) => {
      fetch(urlParams.get('config')).then(r => r.json()).then(config => {
        resolve(config);
      });
    });
    promises.push(configPromise);
  }

  return Promise.all(promises).then(results => {

    let backendMap = defaultBackendMap;
    if (results.length > 0) {
      backendMap = results[0];
    }

    let params = {};
    if (results.length > 1) {
      params = results[1];
    }

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


    let backend = backendMap.anySource[0]; 

    if (backendMap.anySource.includes(params.backend) || 
      (backendMap[source] && backendMap[source].includes[params.backend])) {
      backend = params.backend;
    }
    else if (backendMap[source]) {
      backend = backendMap[source][0];
    }

    launchConfig = {
      source,
      backendUrl: backend,
      params,
    };

    return launchConfig;
  });
}
