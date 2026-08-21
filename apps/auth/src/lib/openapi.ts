/** biome-ignore-all lint/suspicious/noExplicitAny: Ignore */
import { auth } from "./auth";

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = () => {
  _schema ??= auth.api.generateOpenAPISchema();
  return _schema;
};

export const OpenAPI = {
  components: getSchema().then(({ components }) => components) as Promise<any>,
  getPaths: (prefix = "/api/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const pathConfig = paths[path];
        if (!pathConfig) {
          continue;
        }

        const key = prefix + path;
        reference[key] = pathConfig;

        for (const method of Object.keys(pathConfig)) {
          const operation = (reference[key] as any)[method];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<any>,
} as const;
