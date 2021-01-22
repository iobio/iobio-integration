const backendMap = {
  "https://mosaic.chpc.utah.edu": [
    "mosaic.chpc.utah.edu/gru/api/v1",
    "mosaic.chpc.utah.edu/gru-dev",
  ],
  "https://cddrc.utah.edu": [
    "mosaic.chpc.utah.edu/gru/api/v1",
    "mosaic.chpc.utah.edu/gru-dev",
  ],
  "https://mosaic-staging.chpc.utah.edu": [
    "mosaic-staging.chpc.utah.edu/gru/api/v1",
  ],
};

export function createBackendManager(dataSourceUrl) {
  if (!backendMap[dataSourceUrl]) {
    return new BackendManager(['backend.iobio.io']);
  }

  return new BackendManager(backendMap[dataSourceUrl]);
}

class BackendManager {
  constructor(backends) {
    this.backends = backends;
  }

  defaultBackend() {
    return this.backends[0];
  }

  getBackend(backend) {
    if (this.backends.includes(backend)) {
      return backend;
    }
    else {
      return this.defaultBackend();
    }
  }
}
