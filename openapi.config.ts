import { generateService } from '@umijs/openapi';

generateService({
  requestLibPath: "import libs from '@/libs/libs'",
  schemaPath: "http://localhost:8888/api/v3/api-docs",
  serversPath: "./src/api",
});
