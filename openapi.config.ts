import { generateService } from "@umijs/openapi";

generateService({
  requestLibPath: "import request from '@/libs/request'",
  schemaPath: "http://localhost:8888/api/v3/api-docs",
  serversPath: "./src",
});
