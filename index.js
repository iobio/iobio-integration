let launchConfig;
export async function getLaunchConfig() {

  if (launchConfig) {
    return launchConfig;
  }

  const urlParams = new URLSearchParams(location.search);

  const backendMapPromise = new Promise((resolve, reject) => {
    fetch('/config/backend_map.json').then(r => r.json()).then(backendMap => {
      resolve(backendMap);
    });
  });

  const promises = [backendMapPromise];

  if (urlParams.has('config')) {
    const configPromise = new Promise((resolve, reject) => {
      fetch(urlParams.get('config')).then(r => r.json()).then(config => {
        resolve(config);
      });
    });
    promises.push(configPromise);
  }

  return Promise.all(promises).then(results => {

    const backendMap = results[0];

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

    let backendUrl = 'backend.iobio.io';
    const backends = backendMap[params.source];
    if (backends) {
      backendUrl = backends.includes(params.backend_url) ? params.backend_url : backends[0]; 
    }

    launchConfig = {
      backendUrl,
      params,
    };

    return launchConfig;
  });
}
