import { LogSourceRepository } from "./log_source_repository";
import type { LogRepository } from "./types";

export * from "./types";
export { parse_log_query, serialize_log_query } from "./query";
export { parse_user_agent, type UserAgentInfo } from "./user_agent";
export {
  parse_nginx_log,
  parse_nginx_time,
  parse_request_line,
  type NginxParseResult,
} from "./nginx_parser";
export {
  get_log_source_status,
  load_log_records,
  type LoadOptions,
  type LogSnapshot,
  type LogSourceStatus,
} from "./source";

let repository: LogRepository | null = null;

/** Jedyne wejscie dla konsumentow — dane sa zawsze ze zdalnego logu nginx. */
export function get_log_repository(): LogRepository {
  repository ??= new LogSourceRepository();
  return repository;
}
